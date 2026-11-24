/**
 * 访问令牌续期（双 token 机制的前端部分）
 *
 * 规则：
 *   1. 访问令牌（token）只有 60 分钟，过期后接口返回业务码 4011；
 *      由这里用刷新令牌换一对新令牌，然后把原请求重试一次。
 *   2. 同一时刻只允许一个刷新请求（single-flight），并发 4011 共用同一次结果，
 *      避免多请求同时轮换导致刷新令牌被判定为「重放」。
 *   3. 刷新失败分两种：
 *      - 刷新令牌确实不可用（服务端给出业务失败 / 4xx）：清空本地会话并回登录页；
 *      - 网络异常：保留本地会话，只提示，等下次请求再试。
 *   4. 页面存活期间按「到期前 5 分钟」主动续期；多个标签页通过 storage 事件同步令牌。
 */
import axios from 'axios';
import { resolveApiUrl } from '/@/core/app-api-url';
import { useGlobSetting } from '/@/core/hooks/setting';
import { useMessage } from '/@/core/hooks/useMessage';
import { EncryptionFactory } from '/@/core/utils/jcode';
import { Persistent } from '/@/core/utils/cache/persistent';
import {
  REFRESH_TOKEN_KEY,
  REFRESH_TOKEN_EXPIRES_KEY,
  TOKEN_EXPIRES_KEY,
  TOKEN_KEY,
} from '/@/core/enums/cacheEnum';
import { ResultEnum } from '/@/core/enums/httpEnum';
import { useUserStoreWithOut } from '/@/core/store/organization/user';

import { t } from '/@/core/locales/setupI18n';

/** 刷新接口地址（与后端 LoginController 的字面量路由一致） */
const REFRESH_URL = 'login/refresh';
/** 携带刷新令牌的请求头（与后端 AuthTokenConstants.RefreshTokenHeader 一致） */
const REFRESH_TOKEN_HEADER = 'X-Refresh-Token';
/** 主动续期比访问令牌到期提前的毫秒数 */
const REFRESH_AHEAD_MS = 5 * 60 * 1000;
/** 一次性下载/打印等把 token 拼进 URL 的场景，提前多久续期 */
const URL_TOKEN_GUARD_MS = 60 * 1000;

const { error } = useMessage();

interface RefreshOutcome {
  ok: boolean;
  /** 刷新令牌是否被服务端明确判定为不可用 */
  definitive: boolean;
}

/** single-flight：并发 4011 共用同一个刷新 Promise */
let refreshing: Promise<RefreshOutcome> | null = null;
let autoRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let sessionExpireHandling = false;
let storageBound = false;

function getApiBase(): string {
  const { apiUrl } = useGlobSetting();
  return resolveApiUrl(apiUrl).replace(/\/+$/, '');
}

/** 会话已失效：清本地令牌并回登录页（只执行一次，避免并发请求重复跳转） */
function handleSessionExpired() {
  if (sessionExpireHandling) {
    return;
  }
  sessionExpireHandling = true;
  const store = useUserStoreWithOut();
  const hadSession = !!store.getToken || !!store.getRefreshToken;
  Promise.resolve(store.expireSession())
    .catch(() => undefined)
    .finally(() => {
      // 回到登录页后允许下一次会话再次触发
      setTimeout(() => {
        sessionExpireHandling = false;
      }, 3000);
    });
  if (hadSession) {
    error(`${t('登录已过期，请重新登录')}!`);
  }
}

function postRefresh(refreshToken: string): Promise<RefreshOutcome> {
  return axios
    .post(`${getApiBase()}/${REFRESH_URL}`, null, {
      headers: {
        [REFRESH_TOKEN_HEADER]: refreshToken,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      timeout: 30 * 1000,
    })
    .then((resp) => {
      const body = resp?.data;
      const code = Number(body?.code);
      if (code === ResultEnum.SUCCESS) {
        let data: any = body?.data;
        // 与 transformResponseHook 保持一致：后台开启 ApiDataAes 时信封为 { s: 1, data: 密文 }
        if (Number(body?.s) === 1 && typeof data === 'string') {
          try {
            data = JSON.parse(
              EncryptionFactory.createAesEncryption({ key: 'jcodeapi' }).decrypt(data),
            );
          } catch {
            return { ok: false, definitive: false };
          }
        }
        if (!data?.token) {
          return { ok: false, definitive: false };
        }
        useUserStoreWithOut().setAuthToken({
          token: data.token,
          refreshToken: data.refreshToken,
          expiresIn: Number(data.expiresIn) || 0,
          refreshExpiresIn: Number(data.refreshExpiresIn) || 0,
        });
        return { ok: true, definitive: false };
      }
      // 服务端明确拒绝（400 刷新令牌无效 / 401 未登录 / 4011 令牌过期）
      const definitive =
        code === ResultEnum.FAIL ||
        code === ResultEnum.TIMEOUT ||
        code === ResultEnum.TOKEN_EXPIRED;
      return { ok: false, definitive };
    })
    .catch((e) => {
      // 只有服务端给出 4xx 才认为刷新令牌失效；超时/断网保留会话
      const status = Number(e?.response?.status);
      const definitive = status === 400 || status === 401 || status === 4011;
      return { ok: false, definitive };
    });
}

/**
 * 用刷新令牌换新令牌对。
 * @returns 是否拿到了新令牌（原请求可重试）
 */
export function refreshAccessToken(): Promise<RefreshOutcome['ok']> {
  if (refreshing) {
    return refreshing.then((outcome) => outcome.ok);
  }

  const refreshToken = Persistent.getLocal<string>(REFRESH_TOKEN_KEY) || '';
  if (!refreshToken) {
    handleSessionExpired();
    return Promise.resolve(false);
  }

  // 本地已知刷新令牌过期，不必再发请求
  const refreshExpiresAt = Persistent.getLocal<number>(REFRESH_TOKEN_EXPIRES_KEY) || 0;
  if (refreshExpiresAt && refreshExpiresAt <= Date.now()) {
    handleSessionExpired();
    return Promise.resolve(false);
  }

  refreshing = postRefresh(refreshToken)
    .then((outcome) => {
      if (!outcome.ok) {
        if (outcome.definitive) {
          handleSessionExpired();
        } else {
          error(`${t('刷新登录状态失败，请稍后重试')}!`);
        }
      }
      return outcome;
    })
    .finally(() => {
      refreshing = null;
    });

  return refreshing.then((outcome) => outcome.ok);
}

export function stopTokenAutoRefresh() {
  if (autoRefreshTimer) {
    clearTimeout(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

/** 按访问令牌到期时间安排下一次主动续期 */
export function scheduleTokenAutoRefresh() {
  stopTokenAutoRefresh();

  const refreshToken = Persistent.getLocal<string>(REFRESH_TOKEN_KEY) || '';
  const tokenExpiresAt = Persistent.getLocal<number>(TOKEN_EXPIRES_KEY) || 0;
  if (!refreshToken || !tokenExpiresAt) {
    return;
  }

  const delay = tokenExpiresAt - Date.now() - REFRESH_AHEAD_MS;
  autoRefreshTimer = setTimeout(
    () => {
      autoRefreshTimer = null;
      refreshAccessToken().then((ok) => {
        // 续期成功后再按新的到期时间排下一轮；失败则由后续 4011 兜底
        ok && scheduleTokenAutoRefresh();
      });
    },
    Math.max(delay, 0),
  );
}

/**
 * 取一个可用的访问令牌，必要时先续期。
 * 给「token 拼在 URL 上」的一次性请求（下载、预览、打印、分片上传）使用，
 * 这类请求不走 axios 拦截器，拿不到 4011 自动重试。
 */
export async function ensureValidAccessToken(): Promise<string> {
  const store = useUserStoreWithOut();
  const token = store.getToken;
  const expiresAt = store.getTokenExpiresAt;

  // 没有到期信息时无法判断，只能原样使用
  if (token && !expiresAt) {
    return token;
  }
  if (token && expiresAt - Date.now() > URL_TOKEN_GUARD_MS) {
    return token;
  }
  if (!token && !store.getRefreshToken) {
    return '';
  }

  const ok = await refreshAccessToken();
  return ok ? useUserStoreWithOut().getToken : token;
}

/** 从 localStorage 同步其他标签页的令牌状态（storage 事件只会在其他标签页触发） */
function syncAuthStateFromStorage() {
  Persistent.reloadLocal();
  const store = useUserStoreWithOut();
  const token = Persistent.getLocal<string>(TOKEN_KEY) || '';
  const refreshToken = Persistent.getLocal<string>(REFRESH_TOKEN_KEY) || '';

  if (token === store.getToken && refreshToken === store.getRefreshToken) {
    return;
  }

  if (!token || !refreshToken) {
    // 其他标签页已退出或会话被清空
    store.expireSession();
    return;
  }

  store.syncAuthToken({
    token,
    refreshToken,
    tokenExpiresAt: Persistent.getLocal<number>(TOKEN_EXPIRES_KEY) || 0,
    refreshExpiresAt: Persistent.getLocal<number>(REFRESH_TOKEN_EXPIRES_KEY) || 0,
  });
}

/**
 * 应用启动时调用一次：恢复主动续期定时器 + 绑定跨标签页同步。
 * 放在 router 安装之后（登录页守卫已经能处理无令牌的情况）。
 */
export function setupAuthTokenRuntime() {
  scheduleTokenAutoRefresh();

  if (storageBound || typeof window === 'undefined') {
    return;
  }
  storageBound = true;
  window.addEventListener('storage', (e) => {
    // e.key === null 表示其他标签页执行了 localStorage.clear()
    if (e.key !== null && e.key !== Persistent.getLocalStorageKey()) {
      return;
    }
    syncAuthStateFromStorage();
  });
}
