import type { RouteLocationRaw } from 'vue-router';
import type { moduleEntity } from '/@/core/store/system/module';

const EXTERNAL_RE = /^https?:\/\//i;

function parsePath(url: string, menuId: string): RouteLocationRaw {
  const [path, search] = url.split('?', 2);
  const query = Object.fromEntries(new URLSearchParams(search || ''));
  // 应用包清单里的地址可能不带前导斜杠，路由 path 必须补上
  return { path: path.startsWith('/') ? path : `/${path}`, query: { ...query, menuId } };
}

/**
 * 把菜单解析成当前窗口可直接跳转的路由。
 *
 * 应用包导入的菜单通常只配置 url、不配置 target，
 * 这里对未知/空 target 按普通路由兜底，避免菜单和应用首页无法进入。
 */
export function resolveMenuEntry(menu: moduleEntity): RouteLocationRaw | null {
  if (!menu) {
    return null;
  }
  const menuId = menu.f_EnCode || menu.f_ModuleId;
  const url = menu.oldUrlAddress || menu.f_UrlAddress || '';

  if (EXTERNAL_RE.test(url) || url.includes('.html')) {
    return { path: '/system/iframe', query: { menuId, frameSrc: url } };
  }

  switch (menu.f_Target) {
    case 'expand':
      return null;
    case 'view':
    case 'blankView':
      return url ? parsePath(url, menuId) : null;
    default:
      return url ? parsePath(url, menuId) : null;
  }
}
