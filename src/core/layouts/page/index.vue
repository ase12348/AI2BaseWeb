<template>
  <div :class="prefixCls" :style="siderStyle">
    <!-- <div class="jcode-app-loading" style="position: absolute; z-index: 0">
      <span class="jcode-app-loading-dot"><i></i><i></i><i></i><i></i></span>
    </div> -->
    <RouterView>
      <template #default="{ Component, route }">
        <transition name="fade-transform" mode="out-in">
          <keep-alive :include="cacheList">
            <component :key="getRouteId(route)" :is="getPageComponent(route, Component)" />
          </keep-alive>
        </transition>
      </template>
    </RouterView>
    <FrameLayout />
  </div>
</template>

<script lang="ts" setup>
  import { computed, h, resolveComponent } from 'vue';

  import FrameLayout from '/@/core/layouts/iframe/index.vue';

  import { useMultipleTabStore } from '/@/core/store/modules/multipleTab';
  import { usePermissionModuleStore } from '/@/core/store/permission/module';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { getRouteId } from '/@/core/utils';

  const { options } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-layout-main`;

  const tabStore = useMultipleTabStore();

  const reloadId = computed(() => tabStore.$state.reloadId);

  const cacheList = computed((): string[] => {
    if (!options.params.isTabsCache) {
      return [];
    }
    const res: string[] = [];
    tabStore.getTabList.forEach((item) => {
      if (!item.ignoreKeepAlive && item.id != reloadId.value) {
        res.push(item.id);
      }
    });
    return res;
  });

  const comList: Record<string, any> = {};

  const getPageComponent = (route: any, Component: any) => {
    let name = getRouteId(route);
    if (route.query?.frameSrc) {
      name = 'jcode_iframe_page';
    }

    if (name == reloadId.value || !getPageAuth(name)) {
      return h('div');
    }

    if (route.path === '/system/form/index') {
      // 表单页面
      Component = resolveComponent(name);
    }

    if (!comList[name]) {
      const Com = {
        name: name,
        render() {
          return h(Component);
        },
      };

      comList[name] = Com;
    }

    return comList[name];
  };

  const permissionStore = usePermissionModuleStore();
  const getPageAuth = (moduleCode: string) => {
    return permissionStore.getLoadedState(moduleCode);
  };

  // 主题设置
  const siderStyle = computed(() => ({}));
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-layout-main';

  .@{prefix-cls} {
    position: relative;
    width: 100%;
    height: 100%;
  }

  /* fade-transform */
  .fade-transform-leave-active,
  .fade-transform-enter-active {
    transition: all 0.3s ease;
  }

  .fade-transform-enter-from {
    transform: translateX(-64px);
    opacity: 0;
  }

  .fade-transform-leave-to {
    transform: translateX(64px);
    opacity: 0;
  }
</style>
