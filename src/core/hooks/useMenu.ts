import { computed, unref, ref } from 'vue';
import type { moduleEntity } from '/@/core/modules/system/api/module';

import { t } from '@/core/locales/setupI18n';
import { toTree, toArray } from '@/core/utils/jcode';
import { listenerRouteChange2 } from '/@/core/logics/mitt/routeChange';
import { useGo } from '/@/core/hooks/usePage';
import { getRouteId } from '/@/core/utils';
import { useUserStoreWithOut } from '/@/core/store/organization/user';
import { useModuleStoreWithOut } from '/@/core/store/system/module';
import { resolveMenuEntry } from '/@/core/utils/menuRoute';

const topCilckMenu = ref<string>('');
const currentMenu = ref<moduleEntity>();
/** 上一屏生效的一级菜单：个人中心这类不在菜单表里的页面沿用，侧栏与顶栏不跟着清空 */
const lastTopMenuId = ref<string>('');
let isListen = false;

export function useMenu(notUseGo?: boolean) {
  const userStore = useUserStoreWithOut();
  const moduleStore = useModuleStoreWithOut();
  const getAllModuleList = computed(() => moduleStore.list);
  const getAllModuleGroup = computed(() => moduleStore.group);
  const getAllModuleDic = computed(() => moduleStore.dic);
  const getAllModuleDicByCode = computed(() => moduleStore.dicByCode);

  // 只有一个控制台：导航菜单直接取全量菜单
  const getNavModuleGroup = computed(() => moduleStore.group);

  const getAllModuleExpands = computed(() =>
    getAllModuleList.value.filter((v) => v.f_Target == 'expand'),
  );

  const getAllModuleExpandsTree = computed(() =>
    toTree(getAllModuleExpands.value, 'f_ModuleId', 'f_ParentId', 'f_ModuleId', 'f_FullName'),
  );

  //  getAllModuleList.value.filter((v) => v.f_Target == 'expand')
  const getAllUsedModules = computed(() => {
    const filterIds = getAllModuleList.value
      .filter((item) => item.f_DeleteMark != 0 || item.f_EnabledMark != 1)
      .map((t) => t.f_ModuleId);
    const tree = toTree(
      getAllModuleList.value,
      'f_ModuleId',
      'f_ParentId',
      'f_ModuleId',
      'f_FullName',
      filterIds,
    );

    return toArray(tree);
  });
  const getMyModules = computed(() => {
    if (userStore.getLoginInfo?.isAdmin) {
      return getAllUsedModules.value;
    }
    const moduleAuthIds = userStore.getLoginInfo?.moduleAuthIds || [];
    return getAllUsedModules.value.filter((t) => moduleAuthIds.includes(t.f_ModuleId));
  });

  const getAllMenuTree = computed(() => {
    return getChildMenus('0', moduleStore.group);
  });

  const hasAuthModule = (id: string) => {
    if (userStore.getLoginInfo?.isAdmin) {
      return true;
    }
    const moduleAuthIds = userStore.getLoginInfo?.moduleAuthIds || [];
    return moduleAuthIds.includes(id);
  };
  const hasAuthModuleByCode = (code: string) => {
    const module = getAllModuleDicByCode.value[code];
    return hasAuthModule(module?.f_ModuleId);
  };

  const getModuleByCode = (code: string) => {
    return getAllModuleDicByCode.value[code];
  };

  const getTopMenus = computed(() => {
    return getChildMenus('0', getNavModuleGroup.value, hasAuthModule, true);
  });

  const getSecondMenuTree = computed(() => {
    if (topCurrentMenu.value) {
      return getChildMenus(topCurrentMenu.value, getNavModuleGroup.value, hasAuthModule);
    } else {
      return [];
    }
  });

  const getMenuTree = computed(() => {
    return getChildMenus('0', getNavModuleGroup.value, hasAuthModule);
  });

  const getAllMenuList = computed(() => toArray(getAllMenuTree.value, ['icon']));

  const getParentMenuIds = (id: string) => {
    const res: string[] = [];
    const entity = moduleStore.dic[id];
    if (entity) {
      res.push(entity.f_ModuleId);

      const list = getParentMenuIds(entity.f_ParentId);
      if (list.length > 0) {
        res.push(...list);
      }
    }

    return res;
  };
  const topCurrentMenu = computed(() => {
    if (topCilckMenu.value) {
      return topCilckMenu.value;
    }
    const ids = getParentMenuIds(currentMenu.value?.f_ModuleId || '');
    if (ids.length > 0) {
      return ids[ids.length - 1];
    } else {
      // 非菜单页（个人中心、首页等）：沿用上次生效的一级菜单，混合布局的侧栏保持原样；
      // 上次的一级菜单已不在导航里时退回第一个
      const lastTop = lastTopMenuId.value;
      if (lastTop && getTopMenus.value.some((item) => item.value === lastTop)) {
        return lastTop;
      }
      return getTopMenus.value[0]?.key;
    }
  });

  function getChildMenus(
    parent: string | number,
    group: Record<string, moduleEntity[]>,
    filterMethod?: (id: string) => boolean,
    isNotLoadChildren?: boolean,
  ): Record<string, any>[] {
    const res: Record<string, any>[] = [];
    const list = group[parent] || [];

    list.forEach((item) => {
      if (
        item.f_IsMenu == 1 &&
        item.f_DeleteMark == 0 &&
        item.f_EnabledMark == 1 &&
        (!filterMethod || filterMethod(item.f_ModuleId))
      ) {
        let iconName = item.f_Icon || 'star-outlined';
        if (iconName.indexOf('el-icon') > -1 || iconName.indexOf('jcode-icon') > -1) {
          iconName = 'star-outlined';
        }

        const menuItem: Record<string, any> = {
          // @ts-ignore
          code: item.f_EnCode,
          value: item.f_ModuleId,
          label: t(item.f_FullName),
          icon: iconName,
        };

        if (isNotLoadChildren != true) {
          const children = getChildMenus(menuItem?.value || '', group, filterMethod);
          if (children.length > 0) {
            //@ts-ignore
            menuItem.children = children;
          }
        }

        res.push(menuItem);
      }
    });

    return res;
  }

  async function loadList() {
    await moduleStore.loadList();
  }

  function isURL(s) {
    if (s.includes('html')) return true;
    return /^http[s]?:\/\/.*/.test(s);
  }

  let go: any = null;
  if (!notUseGo) {
    go = useGo();
    if (!isListen) {
      isListen = true;
      listenerRouteChange2((route) => {
        const currentRoute = unref(route);
        // 覆盖状态之前先记下这一屏生效的一级菜单，供下一个非菜单页沿用
        const previousTop = topCurrentMenu.value;
        const menuId = getRouteId(currentRoute);
        const module = getAllModuleList.value.find(
          (t) =>
            t.f_EnCode == menuId && t.f_IsMenu == 1 && t.f_DeleteMark == 0 && t.f_EnabledMark == 1,
        );
        if (module && module.f_IsMenu == 1) {
          currentMenu.value = module;
        } else {
          currentMenu.value = undefined;
        }
        topCilckMenu.value = '';
        if (previousTop) {
          lastTopMenuId.value = previousTop;
        }
      });
    }
  }

  /**
   * 混合布局点一级目录时，取侧栏里第一个能打开的功能菜单。
   * 复用 getChildMenus 的树，与侧栏渲染的是同一份数据、同一个顺序；
   * 带 children 的节点只能展开（lr-menu 不会 emit click），要继续往里找叶子。
   */
  function getFirstOpenableMenu(topMenuId: string): moduleEntity | undefined {
    const candidates: moduleEntity[] = [];
    const visited = new Set<string>();
    const walk = (nodes: Record<string, any>[]) => {
      (nodes || []).forEach((node) => {
        if (visited.has(node.value)) {
          return;
        }
        visited.add(node.value);
        if (node.children?.length) {
          walk(node.children);
          return;
        }
        const entity = moduleStore.dic[node.value];
        // 目录、没配地址、无法解析出路由的行都不算功能菜单
        if (entity && resolveMenuEntry(entity)) {
          candidates.push(entity);
        }
      });
    };
    walk(getChildMenus(topMenuId, getNavModuleGroup.value, hasAuthModule));
    // 独立页面 / BI 是 window.open，不会在当前窗口开页签；有站内页面时优先取第一个站内页面
    return (
      candidates.find((item) => !['blankView', 'biView'].includes(item.f_Target)) || candidates[0]
    );
  }

  function openMenu2(key: string, isTop?: boolean, keepTopMenu?: boolean) {
    const module = moduleStore.dic[key];

    if (isTop == true && module?.f_Target == 'expand') {
      topCilckMenu.value = module.f_ModuleId;
      // 切换一级菜单时默认打开侧栏第一个功能菜单，避免主内容区还停在别的模块
      const first = getFirstOpenableMenu(module.f_ModuleId);
      if (first && go) {
        // 复用本函数的 target 分支，行为与手动点这个子菜单完全一致；
        // keepTopMenu 保住刚设置的一级菜单，直到路由变化由 listener 接管
        openMenu2(first.f_ModuleId, false, true);
      }
      return;
    } else if (!keepTopMenu && !['expand', 'blankView', 'biView'].includes(module?.f_Target)) {
      topCilckMenu.value = '';
    }

    if (isURL(module?.f_UrlAddress || '')) {
      if (module.f_Target === 'blankView') {
        window.open(module.oldUrlAddress, '_blank');
      } else {
        go({
          path: `/system/iframe`,
          query: { menuId: module.f_EnCode, frameSrc: module?.oldUrlAddress },
        });
      }
    } else if (module.f_Target === 'view') {
      const [path, search] = module.oldUrlAddress.split('?', 2);
      const params = Object.fromEntries(new URLSearchParams(search || ''));
      go({ path: path, query: { ...params, menuId: module.f_EnCode } });
    } else if (module.f_Target === 'blankView') {
      const [path, search] = module.oldUrlAddress.split('?', 2);
      const params = Object.fromEntries(new URLSearchParams(search || ''));
      const routeUrl = go(
        { path: path, query: { ...params, menuId: module.f_EnCode } },
        false,
        true,
      );
      window.open(routeUrl.href, '_blank');
    } else if (module.f_Target !== 'expand' && module.f_UrlAddress) {
      // 只有 url、没有 target 的菜单按普通路由兜底
      const [rawPath, search] = module.oldUrlAddress.split('?', 2);
      const params = Object.fromEntries(new URLSearchParams(search || ''));
      const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      go({ path, query: { ...params, menuId: module.f_EnCode } });
    }
  }

  let timer;
  const openMenu = (key: string, isTop?: boolean) => {
    if (!timer) {
      timer = window.setTimeout(() => {
        timer = null;
      }, 200);
      return openMenu2(key, isTop);
    } else {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
      }, 200);
    }
  };

  return {
    getAllModuleList,
    getAllModuleExpands,
    getAllModuleExpandsTree,
    getAllModuleGroup,
    getAllModuleDic,
    getAllModuleDicByCode,
    getAllMenuList,
    getAllMenuTree,
    getMenuTree,
    getTopMenus,
    getSecondMenuTree,
    currentMenu,
    loadList,
    getChildMenus,
    openMenu,

    getAllUsedModules,
    getMyModules,

    hasAuthModule,
    hasAuthModuleByCode,
    getModuleByCode,

    topCurrentMenu,
    topCilckMenu,
  };
}
