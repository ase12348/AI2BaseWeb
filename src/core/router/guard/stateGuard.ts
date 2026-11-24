import type { Router } from 'vue-router';
import { useAppStore } from '/@/core/store/modules/app';
import { useMultipleTabStore } from '/@/core/store/modules/multipleTab';
import { useUserStoreWithOut } from '/@/core/store/organization/user';
import { usePermissionModuleStoreWithOut } from '/@/core/store/permission/module';
import { removeTabChangeListener } from '/@/core/logics/mitt/routeChange';
import { useGlobSetting } from '/@/core/hooks/setting';
import { imClose } from '/@/core/utils/im';

const { options: webCofing } = useGlobSetting();
export function createStateGuard(router: Router) {
  router.afterEach((to) => {
    // 跳转到登录页清空登录信息
    if (to.path === webCofing.loginPage.url) {
      const tabStore = useMultipleTabStore();
      const userStore = useUserStoreWithOut();
      const appStore = useAppStore();
      const permissionModuleStore = usePermissionModuleStoreWithOut();
      appStore.resetState();
      tabStore.resetState();
      userStore.resetState();
      permissionModuleStore.clear();
      removeTabChangeListener();

      if (webCofing.params.imOpen) {
        imClose();
      }
    }
  });
}
