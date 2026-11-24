import type { RouteRecordRaw } from 'vue-router';

import { createRouter, createWebHistory } from 'vue-router';
import { useGlobSetting } from '/@/core/hooks/setting';

const { urlPrefix, options } = useGlobSetting();
const basicRoutes = [
  {
    path: '/',
    redirect: options.homePage.url,
  },
  // 应用开发工作台已下线：旧地址（历史书签/缓存页签）回首页，不留 404。
  // 必须放在 catch-all 之前，否则路由匹配阶段就先被重定向到 404 页。
  {
    path: '/plugin/plugindevelop/index',
    redirect: options.homePage.url,
  },
  {
    path: '/plugin/plugindevelop',
    redirect: options.homePage.url,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/system/404',
  },
];
// app router
// 创建一个可以被 Vue 应用程序使用的路由实例
export const router = createRouter({
  // 设置路由模式,发布需要后端配合。
  history: createWebHistory(urlPrefix || '/'),
  // 应该添加到路由的初始路由列表。
  routes: [],
  // 是否应该禁止尾部斜杠。默认为假
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// config router
// 配置路由器
// 【注意】这里只注册路由，不调用 app.use(router)：
// vue-router 的 install 钩子会同步触发初始导航，须等 bootstrap 把全部
// 内置路由注册完再由它调用 app.use(router)，避免初始导航时路由表残缺。
export function setupRouter(views: any[]) {
  const routes = views as unknown as RouteRecordRaw[];
  routes.forEach((route) => {
    router.addRoute(route);
  });

  basicRoutes.forEach((route) => {
    // @ts-ignore
    router.addRoute(route);
  });
}

// 发版兜底：旧版本页面仍在运行时，动态 import 已被删除的旧 chunk 会抛
// "Failed to fetch dynamically imported module"（nginx 把 .js 回退成 index.html 时同样报这个）。
// 此时自动刷新一次，让浏览器拿到最新的 index.html 与入口 chunk。
// 用 sessionStorage 记录时间戳，10 秒内只刷一次，避免刷不到新版本时死循环。
const CHUNK_RELOAD_KEY = 'lr_chunk_error_reload_at';

function reloadOnChunkError(error: unknown) {
  const message = String((error as Error)?.message ?? error);
  if (!message.includes('Failed to fetch dynamically imported module')) {
    return;
  }
  const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
  if (Date.now() - last < 10_000) {
    return;
  }
  sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  window.location.reload();
}

router.onError(reloadOnChunkError);

// 路由之外的异步组件 / 模块加载失败同样兜底
window.addEventListener('unhandledrejection', (event) => {
  reloadOnChunkError(event.reason);
});
