import type { Router } from 'vue-router';
import { useUserStoreWithOut } from '/@/core/store/organization/user';
import { useAppStoreWithOut } from '/@/core/store/modules/app';
import { useMultipleTabWithOutStore } from '/@/core/store/modules/multipleTab';
import { usePermissionModuleStoreWithOut } from '/@/core/store/permission/module';
import { useGlobSetting } from '/@/core/hooks/setting';
import { imInit } from '/@/core/utils/im';
import { useMenu } from '/@/core/hooks/useMenu';
import { getRouteId } from '/@/core/utils';
import { getRedirectData } from './util';

// const aesEncryption = EncryptionFactory.createAesEncryption({ key: 'jcode_tenant' });

const { options: webCofing } = useGlobSetting();
const userStore = useUserStoreWithOut();
const tabStore = useMultipleTabWithOutStore();
const permissionModuleStore = usePermissionModuleStoreWithOut();
const { loadList, hasAuthModuleByCode, getModuleByCode } = useMenu(true);
export function createPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // console.log(to.query.code, 'to.query.code');
    // 飞书登录
    /*    if (to.query.code) {
      const res = await userStore.loginByFeiShu(to.query.code as string);
      if (res) {
        const userAgent = navigator.userAgent;
        const mobileRegex = /iPhone|iPad|iPod|Android/i;
        const isMobile = mobileRegex.test(userAgent);

        const token = userStore.getToken;
        if (isMobile) {
          location.href = `http://192.168.3.10:8081/jcodeapph5/#/pages/workflow/mytask/single?token=${token}`;
          return;
        } else {
          next(webCofing.homePage.url);
        }
      }
    }*/

    /** 发给客户的版本需要删除掉 */
    /*if (isOnline) {
      // 体验触发
      if (to.query.token) {
        const ltoken = decodeURIComponent(String(to.query.token));
        const m = myAesDecrypt(ltoken, 'jcode');
        // console.log(m, webCofing.homePage.url, 'm');
        if (m) {
          const d = new Date();
          if (d.getTime() - parseInt(m) < 3600000) {
            const tenantNo = to.query.t;
            const account = to.query.a || 'system';
            const password = 'jcode.com1c';
            // const tenantTaken = aesEncryption.encrypt(`jcode.sass.${tenantNo}`);
            // const tenantCompany = String(to.query.c) || '体验公司';
            // const tenantName = String(to.query.n) || '体验租户';

            if (!tenantNo) {
              return;
            }
            if (tenantNo == '18702193424' && account == 'host') {
              const res = await userStore.login({ account: 'system', password: 'jcode.com1c' });
              if (res) {
                next(webCofing.homePage.url);
              }
            } else {
              const res = await userStore.login({
                account: `${account}`,
                password: account === 'system' ? password : '123456',
                // tenant: { no: tenantTaken, company: tenantCompany, name: tenantName },
              });
              if (res) {
                next(webCofing.homePage.url);
              }
            }
          }
        }
        return;
      }
      if (to.path === '/login/page') {
        location.href = 'https://www.jcodesoft.com/Home/Index';
        return;
      }
    }*/

    const token = userStore.getToken;
    // 没有登录信息
    if (!token) {
      // 主题跟随账号：退出登录后立即回到默认主题，避免登录页沿用上一个账号的主题
      useAppStoreWithOut().clearThemeSetting();
      if (to.meta.isNotAuth || to.path === webCofing.loginPage.url) {
        next();
        return;
      }
      // redirect login page
      next(getRedirectData(to.fullPath));
      return;
    }

    if (to.path !== webCofing.loginPage.url && !to.meta.isNotAuth) {
      if (userStore.userInfo === null) {
        try {
          await userStore.loadLoginInfo();
          if (webCofing.params.imOpen && userStore.getLoginInfo?.id) {
            await imInit(userStore.getLoginInfo?.id);
          }
        } catch {
          // alert('请求异常请重新刷新页面！');
          next('/system/500');
          // 暂时删除
          // next(getRedirectData(to.fullPath));
          return;
        }

        // 加载菜单
        await loadList();

        // 加载当前登录用户的主题设置（保证登录后主题立即生效）
        await useAppStoreWithOut().loadThemeSetting(false);

        // 平台不再自动挂载动态桌面，清掉旧版本遗留的桌面页签；
        // 桌面页仍可通过「桌面视图」类型的菜单按需打开
        tabStore.removeDeskTops();

        tabStore.filterAuth();
        tabStore.sortTabsByNotClose();
      }
      const moduleCode = getRouteId(to);
      const moduleObject = getModuleByCode(moduleCode);
      if (!to.meta.isNotMenu && moduleCode !== 'jcode_desktop_null_id') {
        // 验证页面权限
        if (!hasAuthModuleByCode(moduleCode)) {
          next('/system/403');
          return;
        } else {
          if (userStore.getLoginInfo.isAdmin) {
            permissionModuleStore.setNotAuth(
              moduleCode,
              moduleObject?.f_ModuleId,
              moduleObject?.f_FullName,
            );
          } else {
            await permissionModuleStore.load(
              moduleCode,
              moduleObject?.f_ModuleId,
              moduleObject?.f_FullName,
            );
          }
        }
      } else {
        permissionModuleStore.setNotAuth(
          moduleCode,
          moduleObject?.f_ModuleId,
          moduleObject?.f_FullName,
        );
      }
    }

    next();
  });
}
