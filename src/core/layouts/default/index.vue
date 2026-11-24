<template>
  <div :class="prefixCls" :style="containerStyle">
    <LayoutHeader v-if="!isFrame" />
    <div class="lr-block" style="display: flex">
      <LayoutSideBar v-if="!isFrame && showSideBar" />
      <div
        :class="['lr-block', `${prefixCls}-main`]"
        :style="{ 'padding-top': isFrame ? '0px' : showTabs ? '40px' : '0px' }"
      >
        <LayoutTabsBar v-if="!isFrame && showTabs" />
        <PageLayout />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import LayoutHeader from './header/index.vue';
  import LayoutSideBar from './sider/index.vue';
  import LayoutTabsBar from './tabs/index.vue';
  import PageLayout from '/@/core/layouts/page/index.vue';

  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useAppSetting } from '/@/core/hooks/setting/useAppSetting';
  import { useAppStore } from '/@/core/store/modules/app';

  const route = useRoute();
  const getQueryParam = (paramName) => {
    return route.query[paramName];
  };

  const isFrame = computed(
    () =>
      getQueryParam('hideLayout') !== '0' &&
      (top?.location != window.location || getQueryParam('hideLayout') === '1'),
  );

  // 主题设置
  const appStore = useAppStore();
  const { themeSetting } = storeToRefs(appStore);
  const showTabs = computed(() => themeSetting.value.showTabs);

  const containerStyle = computed(() => ({
    paddingTop: isFrame.value ? '0px' : 'var(--jcode-header-height, 56px)',
    backgroundImage: 'var(--jcode-app-bg-image, none)',
  }));

  // 默认设置
  const { options } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-default-layout`;

  const { getMemuType } = useAppSetting();

  // 顶部导航不显示侧栏
  const showSideBar = computed(() => !isFrame.value && getMemuType.value !== 'top');
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-default-layout';
  @prefix-cls-main: ~'@{namespace}-default-layout-main';

  .@{prefix-cls} {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: padding-left 0.3s;
    background-color: var(--color-bg-layout);
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  .@{prefix-cls-main} {
    position: relative;
    flex: 1;
    width: 0;
    height: 100%;
    padding-top: 40px;
  }
</style>
