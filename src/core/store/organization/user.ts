import type { LoginInfo } from '/#/store';
import type { ErrorMessageMode } from '/#/axios';
import {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_EXPIRES_KEY,
  REFRESH_TOKEN_EXPIRES_KEY,
  LOCALE_POST_KEY,
} from '/@/core/enums/cacheEnum';

import { defineStore } from 'pinia';
import { router } from '/@/core/router';
import { store } from '/@/core/store';
import { Persistent } from '/@/core/utils/cache/persistent';
import { scheduleTokenAutoRefresh, stopTokenAutoRefresh } from '/@/core/utils/http/tokenRefresh';
import { useMessage } from '/@/core/hooks/useMessage';
import { useGlobSetting } from '/@/core/hooks/setting';
import { isNullOrEmpty, HashingFactory } from '@/core/utils/jcode';

import { defHttp } from '/@/core/utils/http/axios';

import { t } from '@/core/locales/setupI18n';

/**
 * @description: 登录参数
 */
export interface LoginReq {
  account: string;
  password: string;

  /**
   * 租户信息
   */
  tenant?: {
    no?: string;
    name?: string;
    company?: string;
    token?: string;
  };
}

/**
 * @description: 登录返回数据
 */
export interface LoginRes {
  /** 访问令牌（60 分钟） */
  token: string;
  /** 刷新令牌（会话绝对有效期） */
  refreshToken: string;
  /** 访问令牌有效期（秒） */
  expiresIn: number;
  /** 刷新令牌剩余有效期（秒） */
  refreshExpiresIn: number;
  user: UserEntity;
}

/**
 * @description: 令牌对（本地状态用）
 */
export interface AuthTokenState {
  token: string;
  refreshToken: string;
  tokenExpiresAt: number;
  refreshExpiresAt: number;
}

/**
 * @description: 用户信息
 */
export interface UserEntity {
  /**
   * 用户主键
   */
  f_UserId: string;
  /**
   * 账户
   */
  f_Account: string;
  /**
   * 密码
   */
  f_Password: string;
  /**
   * 真实姓名
   */
  f_RealName: string;
  /**
   * 头像
   */
  f_HeadIcon: string;
  /**
   * 性别
   */
  f_Gender: number;
  /**
   * 生日
   */
  f_Birthday: string;
  /**
   * 手机
   */
  f_Mobile: string;
  /**
   * 电话
   */
  f_Telephone: string;
  /**
   * 电子邮件
   */
  f_Email: string;
  /**
   * QQ号
   */
  f_OICQ: string;
  /**
   * 微信号
   */
  f_WeChat: string;
  /**
   * MSN
   */
  f_MSN: string;
  /**
   * 公司主键
   */
  f_CompanyId: string;
  /**
   * 部门主键
   */
  f_DepartmentId: string;
  /**
   * 安全级别：1超级用户 2三员-系统管理员、3三员-安全管理员、4三员-审计员
   */
  f_SecurityLevel: number;
  /**
   * 身份-用户密级(0公开，1内部，2秘密，3机密，4绝密)--ADD BY SSY 20230315
   */
  f_SecretLevel: number;
  /**
   * 身份-身份证号--ADD BY SSY 20230315
   */
  f_IdCard: string;
  /**
   * 身份-政治面貌--ADD BY SSY 20230315
   */
  f_Party: string;
  /**
   * 身份-行政职务--ADD BY SSY 20230315
   */
  f_Job: string;
  /**
   * 身份-行政职级--ADD BY SSY 20230315
   */
  f_Level: string;
  /**
   * 身份-职称等级--ADD BY SSY 20230315
   */
  f_Title: string;
  /**
   * 身份-技术职务--ADD BY SSY 20230315
   */
  f_Role: string;
  /**
   * 身份-管理职务--ADD BY SSY 20230315
   */
  f_Post: string;
  /**
   * 身份-职业技能--ADD BY SSY 20230315
   */
  f_WorkerDegree: string;
  /**
   * 全拼--ADD BY SSY 20230414
   */
  f_FullSpelling: string;
  /**
   * 简拼
   */
  f_SimpleSpelling: string;
  /**
   * 科室--ADD BY SSY 20230414
   */
  f_Room: string;
  /**
   * 排序码
   */
  f_SortCode: number;
  /**
   * 有效标志
   */
  f_EnabledMark: number;
  /**
   * 备注
   */
  f_Description: string;
  /**
   * 创建日期
   */
  f_CreateDate: string;
  /**
   * 创建用户主键
   */
  f_CreateUserId: string;
  /**
   * 创建用户
   */
  f_CreateUserName: string;
  /**
   * 修改日期
   */
  f_ModifyDate: string;
  /**
   * 修改用户主键
   */
  f_ModifyUserId: string;
  /**
   * 修改用户
   */
  f_ModifyUserName: string;

  /*
   *是否需要修改密码 1需要 2不需要
   */
  f_IsNeedChangePwd: number;

  /**
   * 用户角色信息
   */
  roleIds?: string;
  /**
   * 用户岗位信息
   */
  postIds: string;

  /**
   * 功能权限id
   */
  moduleAuthIds?: string[];

  /**
   * 租户编码
   */
  tenantNo?: string;
  /**
   * 租户名称
   */
  tenantName?: string;
  /**
   * 租户公司
   */
  tenantCompany?: string;
}

const urlPrefix = `organization/user`;
export const api = {
  /**
   * @description: 用户登录
   */
  login: (data: LoginReq, mode: ErrorMessageMode = 'modal') => {
    return defHttp.post<LoginRes>(
      {
        url: `login`,
        params: {
          tenantNo: data.tenant?.no,
          tenantName: data.tenant?.name,
          tenantCompany: data.tenant?.company,
          tenantTaken: data.tenant?.token,
        },
        data: {
          account: data.account,
          password: data.password,
        },
      },
      {
        errorMessageMode: mode,
        withToken: false,
      },
    );
  },
  loginByFeishu: (code: string) => {
    return defHttp.post<LoginRes>(
      {
        url: `login/openid`,
        params: {
          code,
          type: 'feishu',
        },
      },
      {
        withToken: false,
      },
    );
  },
  /**
   * @description: 退出登录（作废服务端会话）
   */
  logout: (refreshToken: string) => {
    return defHttp.post(
      {
        url: `login/logout`,
        headers: {
          'X-Refresh-Token': refreshToken,
        },
        // 退出接口不值得让用户等，超时后服务端会话自然过期
        timeout: 10 * 1000,
      },
      {
        withToken: false,
        errorMessageMode: 'none',
      },
    );
  },
  /**
   * @description: 获取登录用户信息
   */
  getLoginInfo: () => {
    return defHttp.get<UserEntity>({ url: 'login/pc' }, { errorMessageMode: 'none' });
  },
  getUsers: (ids) =>
    defHttp.post({
      url: `${urlPrefix}s`,
      data: { ids },
    }),
  get: (id: string) => {
    return defHttp.get({
      url: `${urlPrefix}/${id}`,
    });
  },
};

const { options: webCofing } = useGlobSetting();
const { createConfirm, warning } = useMessage();

interface StateType {
  userInfo: Nullable<LoginInfo>;
  token?: string;
  /** 刷新令牌 */
  refreshToken?: string;
  /** 访问令牌到期时间（毫秒时间戳） */
  tokenExpiresAt?: number;
  /** 刷新令牌到期时间（毫秒时间戳） */
  refreshExpiresAt?: number;
  updateList: Record<string, boolean>;
  dic: Record<string, UserEntity>;
  currentPost?: string;
}

let UserLoadTimer; // 加载用户信息定时器
const UserLoadings: string[] = []; // 需要加载的用户信息

export const useUserStore = defineStore('organization-user', {
  state: (): StateType => ({
    // user info
    userInfo: null,
    // token
    token: undefined,
    // 刷新令牌
    refreshToken: undefined,
    // 访问令牌到期时间
    tokenExpiresAt: undefined,
    // 刷新令牌到期时间
    refreshExpiresAt: undefined,
    updateList: {},
    dic: {},
    //
    currentPost: undefined,
  }),
  getters: {
    getLoginInfo(state): LoginInfo {
      // @ts-ignore
      const userInfo = state.userInfo || ({} as LoginInfo);
      const postIds = userInfo.postIds || [];

      const type = state.currentPost || Persistent.getLocal<string>(LOCALE_POST_KEY) || '';
      const typeList = type.split('|');
      let postId = '';
      if (typeList.length > 1) {
        postId = typeList[1];
        if (typeList[0] === this.userInfo?.id && postIds.includes(typeList[1])) {
          userInfo.postId = typeList[1];
        }
      }

      if (!userInfo.postId && postIds.length > 0) {
        userInfo.postId = postIds[0];
      }

      if (!userInfo.postId && postId) {
        userInfo.postId = postId;
      }

      // @ts-ignore
      return userInfo;
    },
    getToken(state): string {
      return state.token || Persistent.getLocal<string>(TOKEN_KEY) || '';
    },
    getRefreshToken(state): string {
      return state.refreshToken || Persistent.getLocal<string>(REFRESH_TOKEN_KEY) || '';
    },
    /** 访问令牌到期时间（毫秒时间戳），0 表示未知 */
    getTokenExpiresAt(state): number {
      return state.tokenExpiresAt || Persistent.getLocal<number>(TOKEN_EXPIRES_KEY) || 0;
    },
  },
  actions: {
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      Persistent.setLocal(TOKEN_KEY, info);
    },
    /**
     * 登录/续期成功后保存令牌对及到期时间
     */
    setAuthToken(data: {
      token?: string;
      refreshToken?: string;
      expiresIn?: number;
      refreshExpiresIn?: number;
    }) {
      const now = Date.now();
      const tokenExpiresAt = data.expiresIn ? now + Number(data.expiresIn) * 1000 : 0;
      const refreshExpiresAt = data.refreshExpiresIn
        ? now + Number(data.refreshExpiresIn) * 1000
        : 0;

      this.token = data.token || '';
      this.refreshToken = data.refreshToken || '';
      this.tokenExpiresAt = tokenExpiresAt;
      this.refreshExpiresAt = refreshExpiresAt;

      Persistent.setLocal(TOKEN_KEY, this.token);
      Persistent.setLocal(REFRESH_TOKEN_KEY, this.refreshToken);
      Persistent.setLocal(TOKEN_EXPIRES_KEY, tokenExpiresAt);
      Persistent.setLocal(REFRESH_TOKEN_EXPIRES_KEY, refreshExpiresAt);

      // 按新的到期时间安排主动续期
      scheduleTokenAutoRefresh();
    },
    /**
     * 同步其他标签页写入的令牌状态（只改内存，不回写 localStorage，避免 ping-pong）
     */
    syncAuthToken(data: AuthTokenState) {
      this.token = data.token;
      this.refreshToken = data.refreshToken;
      this.tokenExpiresAt = data.tokenExpiresAt;
      this.refreshExpiresAt = data.refreshExpiresAt;
      scheduleTokenAutoRefresh();
    },
    /**
     * 清空本地令牌（不通知服务端）
     */
    clearAuthToken() {
      this.token = '';
      this.refreshToken = '';
      this.tokenExpiresAt = 0;
      this.refreshExpiresAt = 0;
      Persistent.removeLocal(TOKEN_KEY);
      Persistent.removeLocal(REFRESH_TOKEN_KEY);
      Persistent.removeLocal(TOKEN_EXPIRES_KEY);
      Persistent.removeLocal(REFRESH_TOKEN_EXPIRES_KEY);
      stopTokenAutoRefresh();
    },
    /**
     * 会话失效：清本地状态并回登录页（刷新令牌已不可用时使用）
     */
    async expireSession() {
      this.clearAuthToken();
      this.setLoginInfo(null);
      await router.push(webCofing.loginPage.url);
    },
    setLoginInfo(info: LoginInfo | null) {
      this.userInfo = info;
    },
    resetState() {
      // 幂等清理：即使内存态为空，也要把 localStorage 里的令牌一起清掉
      this.clearAuthToken();
      this.setLoginInfo(null);
    },
    /**
     * @description: 登录
     */
    async login(
      params: LoginReq & {
        mode?: ErrorMessageMode;
      },
    ) {
      try {
        const { mode, ...loginParams } = params;
        // 密码md5加蜜
        loginParams.password = HashingFactory.createMD5Hashing().hash(loginParams.password);

        if (webCofing.params.isTenant) {
          // 是否开启租户
          const accountList = loginParams.account.split('@');
          if (accountList.length == 2) {
            loginParams.account = accountList[1];
            loginParams.tenant = {
              no: accountList[0],
            };
          }
        }

        const data = await api.login(loginParams, mode);
        if (data) {
          this.setAuthToken(data);
          return true;
        }
      } catch (error) {
        console.error(error);
      }
      return false;
    },
    async loginByFeiShu(code: string) {
      try {
        const data = await api.loginByFeishu(code);
        if (data) {
          this.setAuthToken(data);
          return true;
        }
      } catch (error) {
        console.error(error);
      }
      return false;
    },
    /**
     * @description: 加载登录者信息
     */
    async loadLoginInfo(): Promise<Boolean> {
      const userInfo = await api.getLoginInfo();
      if (userInfo) {
        // console.log(userInfo, 'loadLoginInfo');
        // 此处需要数据格式转化，.net 和 java 可自行处理
        const loginInfo: LoginInfo = {
          id: userInfo.f_UserId,
          account: userInfo.f_Account,
          avatar: userInfo.f_HeadIcon,
          name: userInfo.f_RealName,
          companyId: userInfo.f_CompanyId,
          departmentId: userInfo.f_DepartmentId,
          securityLevel: userInfo.f_SecurityLevel,
          secretLevel: userInfo.f_SecretLevel,
          gender: userInfo.f_Gender,
          desc: userInfo.f_Description,
          moduleAuthIds: userInfo.moduleAuthIds || [],
          isAdmin: userInfo.f_SecurityLevel === 1 || userInfo.f_SecurityLevel === 5,
          roleIds: userInfo.roleIds ? userInfo.roleIds?.split(',') : [],
          postIds: userInfo.postIds ? userInfo.postIds?.split(',') : [],

          tenantNo: userInfo.tenantNo,
          tenantName: userInfo.tenantName,
          tenantCompany: userInfo.tenantCompany,
          f_Mobile: userInfo.f_Mobile,
          f_Telephone: userInfo.f_Telephone,
          f_Email: userInfo.f_Email,
          f_WeChat: userInfo.f_WeChat,
          f_OICQ: userInfo.f_OICQ,
          isNeedChangePwd: userInfo.f_IsNeedChangePwd == 1,
        };
        this.setLoginInfo(loginInfo);

        if (loginInfo.isNeedChangePwd) {
          warning(`${t('请在个人中心修改密码')}！`);
        }

        return true;
      }
      return false;
    },
    /**
     * @description: 退出登录
     */
    async logout(goLogin = true) {
      // 先取出刷新令牌，清空本地状态后再通知服务端作废会话
      const refreshToken = this.getRefreshToken;
      this.clearAuthToken();
      this.setLoginInfo(null);

      if (refreshToken) {
        // 不阻塞退出：SPA 内跳转不会中断已发出的 XHR
        api.logout(refreshToken).catch((e) => console.warn('logout session failed', e));
      }

      goLogin && (await router.push(webCofing.loginPage.url));
    },

    /**
     * @description: 确定是否退出登录
     */
    confirmLoginOut() {
      createConfirm({
        iconType: 'warning',
        title: t('提示'),
        content: `${t('是否退出当前登录')}?`,
        onOk: async () => {
          await this.logout(true);
        },
      });
    },

    async load(userIds: string, isCache: boolean = true) {
      if (isNullOrEmpty(userIds)) {
        return;
      }
      const userList = userIds.split(',');
      userList.forEach((userId) => {
        if (!this.updateList[userId] || !isCache) {
          this.updateList[userId] = true;
          UserLoadings.push(userId);
        }
      });

      // 50ms 内只执行一次
      if (UserLoadings.length > 0 && !UserLoadTimer) {
        UserLoadTimer = setTimeout(async () => {
          const req = String(UserLoadings);
          UserLoadings.length = 0;
          UserLoadTimer = null;
          const list = (await api.getUsers(req)) || [];
          list.forEach((item) => {
            this.dic[item.f_UserId] = item;
          });
        }, 50);
      }
    },
    setCurrentPost(postId: string) {
      this.currentPost = `${this.userInfo?.id}|${postId}`;
      Persistent.setLocal(LOCALE_POST_KEY, this.currentPost);
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWithOut() {
  return useUserStore(store);
}
