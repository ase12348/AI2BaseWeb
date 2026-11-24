import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router';

import { nextTick, unref } from 'vue';
import { defineStore } from 'pinia';

import { store } from '/@/core/store';
import { useGo } from '/@/core/hooks/usePage';
import { Persistent } from '/@/core/utils/cache/persistent';
import { getRouteId } from '/@/core/utils';
import { MULTIPLE_TABS_KEY } from '/@/core/enums/cacheEnum';
import { useGlobSetting } from '/@/core/hooks/setting';
import { useMenu } from '/@/core/hooks/useMenu';

export interface tabItem {
  id: string;
  path: string;
  title: string;
  /**
   * 是否不是菜单(不需要进行权限过滤，但还是需要登录状态的)
   */
  isNotMenu: boolean;
  /**
   * 是否不需要权限验证（不用进行登录者权限校验）
   */
  isNotAuth: boolean;
  /**
   * 不能被关闭
   */
  isNotClosed: boolean;
  /**
   * 是否忽略缓存
   */
  ignoreKeepAlive: boolean;
  /**
   * 第三方地址
   */
  frameSrc?: string;
  /**
   * 是否是桌面
   */
  isDesktop?: boolean;
}

const { options: webCofing } = useGlobSetting();
export interface MultipleTabState {
  tabList: tabItem[];
  lastDragEndIndex: number;
  reloadId: string;
}

function handleGotoPage(tab: tabItem, router: Router) {
  const { currentRoute, replace } = router;
  const menuId = getRouteId(unref(currentRoute));
  if (menuId !== tab.id) {
    replace(getToTarget(tab));
  }
}

const getToTarget = (tab: tabItem) => {
  const { path } = tab;
  return path;
};

const { hasAuthModuleByCode } = useMenu(true);

export const useMultipleTabStore = defineStore({
  id: 'app-multiple-tab',
  state: (): MultipleTabState => ({
    // multiple tab list
    tabList: Persistent.getLocal(MULTIPLE_TABS_KEY) || [],
    // Index of the last moved tab
    lastDragEndIndex: 0,

    reloadId: '',
  }),
  getters: {
    getTabList(state): tabItem[] {
      return state.tabList;
    },
  },
  actions: {
    setReload(id: string) {
      this.reloadId = id;
      nextTick(() => {
        this.reloadId = '';
      });
    },

    resetState(): void {
      this.tabList = [];
    },
    removeDeskTops() {
      this.tabList = this.tabList.filter((item) => {
        if (item.isDesktop && item.isNotClosed) {
          return false;
        }
        return true;
      });
      Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
    },
    filterAuth() {
      this.tabList = this.tabList.filter((item) => {
        if (item.isNotMenu) {
          return true;
        }
        return hasAuthModuleByCode(item.id);
      });
      Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
    },
    goToPage(router: Router) {
      const go = useGo(router);
      const len = this.tabList.length;

      if (len > 0) {
        const page = this.tabList[len - 1];
        const menuId = getRouteId(unref(router.currentRoute));
        if (page.id !== menuId) {
          go(page.path, true);
          return;
        }
      }
      // Jump to the current page and report an error
      go(webCofing.params.userCenterUrl, true);
    },

    async addTab(route: RouteLocationNormalized) {
      // console.log(JSON.stringify(route), 'addTab');

      const { fullPath, path, meta, query } = route;
      if (!meta || meta.isNotTab) {
        return;
      }
      const menuId = getRouteId(route);

      if (!meta?.isNotMenu && !hasAuthModuleByCode(menuId)) {
        return;
      }

      // Existing pages, do not add tabs repeatedly
      const tabHasExits = this.tabList.some((tab) => {
        return tab.id === menuId;
      });

      // If the tab already exists, perform the update operation
      if (!tabHasExits) {
        const tab: tabItem = {
          id: menuId,
          path: fullPath || path,
          title: meta.title || (query?.title as string),
          frameSrc: route.query?.frameSrc as string,
          isNotMenu: meta.isNotMenu as boolean,
          isNotAuth: meta.isNotAuth as boolean,
          isNotClosed: meta.isNotClosed as boolean,
          ignoreKeepAlive: meta.ignoreKeepAlive as boolean,
          isDesktop: path == '/desktop/home/index',
        };
        this.tabList.push(tab);
        Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
      } else {
        // 同一个页签内地址会变（如带上新的查询参数），
        // 记下最新地址，点回页签时回到离开前的位置
        const tab = this.tabList.find((item) => item.id === menuId);
        if (tab && tab.path !== fullPath) {
          tab.path = fullPath;
          Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
        }
      }
    },

    async closeTab(index: number, router: Router) {
      if (index <= -1 || index >= this.tabList.length) {
        return;
      }

      const close = (id: string, isNotClosed = false) => {
        if (isNotClosed) {
          return;
        }
        const index = this.tabList.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.tabList.splice(index, 1);
          Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
        }
      };

      const tab = this.tabList[index];

      const { currentRoute, replace } = router;

      const menuId = getRouteId(unref(currentRoute));
      if (menuId !== tab.id) {
        close(tab.id, tab.isNotClosed);
        return;
      }

      // Closed is activated atb
      let toTarget: RouteLocationRaw = {};

      // If the current is the leftmost tab
      if (index === 0) {
        // 如果没有页面了,跳转到个人中心
        if (this.tabList.length === 1) {
          toTarget = webCofing.params.userCenterUrl;
        } else {
          //  Jump to the right tab
          const page = this.tabList[index + 1];
          toTarget = getToTarget(page);
        }
      } else {
        // Close the current tab
        const page = this.tabList[index - 1];
        toTarget = getToTarget(page);
      }
      close(menuId);
      await replace(toTarget);
    },

    // Close the tab on the right and jump
    async closeLeftTabs(index: number, router: Router) {
      if (index > 0 && index < this.tabList.length) {
        const tab = this.tabList[index];
        this.tabList = this.tabList.filter((item, i) => i >= index || item.isNotClosed);
        Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
        handleGotoPage(tab, router);
      }
    },

    // Close the tab on the left and jump
    async closeRightTabs(index: number, router: Router) {
      if (index >= 0 && index < this.tabList.length - 1) {
        const tab = this.tabList[index];
        this.tabList = this.tabList.filter((item, i) => i <= index || item.isNotClosed);
        Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
        handleGotoPage(tab, router);
      }
    },

    /**
     * Close other tabs
     */
    async closeOtherTabs(index: number, router: Router) {
      const tab = this.tabList[index];
      const len = this.tabList.length;

      const resTablist: tabItem[] = [];
      for (let i = 0; i < len; i++) {
        const closeItem = this.tabList[i];
        if (closeItem.isNotClosed || i === index) {
          resTablist.push(closeItem);
        }
      }
      this.tabList = resTablist;
      Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
      handleGotoPage(tab, router);
    },

    async closeAllTabs(router: Router) {
      this.tabList = this.tabList.filter((item) => item.isNotClosed);
      Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
      this.goToPage(router);
    },

    // Sort the tabs
    async sortTabs(oldIndex: number, newIndex: number) {
      if (newIndex > this.tabList.length - 1 || oldIndex > this.tabList.length - 1) {
        return;
      }
      const currentTab = this.tabList[oldIndex];
      this.tabList.splice(oldIndex, 1);
      this.tabList.splice(newIndex, 0, currentTab);
      this.lastDragEndIndex = this.lastDragEndIndex + 1;
      Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
    },
    async sortTabsByNotClose() {
      const notClosedList = this.tabList.filter((t) => t.isNotClosed);
      const closedList = this.tabList.filter((t) => !t.isNotClosed);
      this.tabList = [...notClosedList, ...closedList];
      Persistent.setLocal(MULTIPLE_TABS_KEY, this.tabList);
    },
  },
});

// Need to be used outside the setup
export function useMultipleTabWithOutStore() {
  return useMultipleTabStore(store);
}
