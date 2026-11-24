<template>
  <div class="jcode-footer">
    <a-config-provider
      :theme="{
        components: {
          Button: {
            colorBgTextHover: themeToken.jcode_colorBgBtnHeader,
            colorText: themeToken.jcode_colorTextBtnHeader,
          },
        },
      }"
    >
      <lr-button
        class="jcode-header-btn"
        type="text"
        iconName="menu-manage"
        :label="$t('菜单')"
        @click="openMenus"
      />
    </a-config-provider>
  </div>
  <div v-show="isMenuOpened" class="jcode-footer-menu-mask" @click.stop="closeMenu"></div>
  <div :class="['jcode-footer-menu_panel', { isOpened: isMenuOpened }]">
    <div class="jcode-footer-menu"><TopMenu /> </div>
    <div class="jcode-footer-sub-menu"><LayoutSideBar /></div>
  </div>
</template>
<script setup lang="ts">
  import { ref, inject } from 'vue';
  import TopMenu from '../topMenu/index.vue';
  import LayoutSideBar from '../sider/index.vue';
  import { listenerRouteChange } from '/@/core/logics/mitt/routeChange';
  // 主题设置
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);
  const isMenuOpened = ref(false);

  const openMenus = () => {
    isMenuOpened.value = !isMenuOpened.value;
  };
  const closeMenu = () => {
    isMenuOpened.value = false;
  };
  listenerRouteChange(() => {
    isMenuOpened.value = false;
  });
</script>
<style lang="less">
  .jcode-footer {
    display: flex;
    position: fixed;
    z-index: 1032;
    bottom: 0;
    left: 0;
    align-items: center;
    width: 100%;
    height: 40px;
    padding-left: 8px;
    background-color: var(--jcode-color-bg-header);

    &::after {
      content: ' ';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: var(--jcode-color-border-header);
    }

    &-menu-mask {
      position: fixed;
      z-index: 1030;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    &-menu_panel {
      position: fixed;
      z-index: 1031;
      bottom: calc(-100% + 40px);
      left: 0;
      width: 400px;
      min-height: 308px;
      max-height: calc(100% - 144px);
      overflow: hidden;
      transition: bottom 0.5s;
      box-shadow: var(--box-shadow-secondary);

      &.isOpened {
        bottom: 40px;
      }
    }

    &-menu {
      position: relative;
      width: 168px;
      transition: all 0.3s;
    }

    &-sub-menu {
      position: absolute;
      top: 0;
      right: 0;
      width: 232px;
      height: 100%;
      overflow: auto;
      transition: all 0.3s;
      background-color: var(--color-bg-container);
    }
  }
</style>
