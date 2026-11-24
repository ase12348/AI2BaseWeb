import type { Router } from 'vue-router';
import { setRouteChange } from '/@/core/logics/mitt/routeChange';

import { createPermissionGuard } from './permissionGuard';
import { createStateGuard } from './stateGuard';

// Don't change the order of creation
export function setupRouterGuard(router: Router) {
  createPageGuard(router);

  createPermissionGuard(router);

  createStateGuard(router);
}

/**
 * 记录页面加载状态,通知页面变更
 */
function createPageGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    // Notify routing changes
    // to.meta._loading = true;
    setRouteChange(to);
    // return true;

    next();
  });
}
