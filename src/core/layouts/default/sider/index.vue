<template>
  <div v-if="menusTree.length > 0" :class="prefixCls" :style="siderStyle">
    <lr-menu
      :class="{ 'jcode-min-side-menu': isSide2 }"
      :mode="getTheme.menuMode"
      :theme="getTheme.menuTheme"
      :meuns="menusTree"
      :collapsed="appStore.menuCollapsed"
      :activeId="activeId"
      @click="handleClick"
    />
    <div v-if="showCollapseBtn" class="collapse-btn"><lr-menu-collapse-btn /></div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject, unref } from 'vue';
  import { storeToRefs } from 'pinia';

  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { useAppStore } from '/@/core/store/modules/app';
  import { useAppSetting } from '/@/core/hooks/setting/useAppSetting';

  const appStore = useAppStore();

  const { options } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-layout-sider`;

  // 主题设置
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);
  const { themeSetting } = storeToRefs(appStore);

  // 菜单设置
  const { getMemuType, getTheme } = useAppSetting();

  const isSide2 = computed(() => getMemuType.value === 'side2');
  const showCollapseBtn = computed(() => !isSide2.value);

  const menuWidth = computed(() =>
    isSide2.value
      ? '80px'
      : appStore.menuCollapsed
        ? `${themeToken.value.collapsedWidth}px`
        : 'var(--jcode-side-width, 232px)',
  );
  const siderStyle = computed(() => ({
    width: menuWidth.value,
    paddingBottom: isSide2.value ? '0' : '40px',
  }));

  const { getMenuTree, getSecondMenuTree, currentMenu, openMenu } = useMenu();

  // 二级菜单图标显隐：showIcon 为 false 时去掉层级 >= 1 的菜单图标
  const stripChildIcon = (list: any[], depth = 0): any[] =>
    (list || []).map((item) => {
      const node = { ...item };
      if (depth >= 1) {
        delete node.icon;
      }
      if (node.children?.length) {
        node.children = stripChildIcon(node.children, depth + 1);
      }
      return node;
    });

  const menusTree = computed(() => {
    const tree = getMemuType.value === 'mix' ? unref(getSecondMenuTree) : unref(getMenuTree);
    return themeSetting.value.showIcon ? tree : stripChildIcon(tree);
  });

  const activeId = computed(() => currentMenu.value?.f_ModuleId);

  const handleClick = ({ value }) => {
    openMenu(value);
  };
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-layout-sider';

  .@{prefix-cls} {
    position: relative;
    z-index: 9;
    top: 0;
    left: 0;
    height: 100%;
    transition: width 0.3s;
    border-right: 1px solid var(--jcode-color-border-right-sider, var(--color-border-secondary));
    background-color: var(--jcode-color-bg-sider, var(--color-bg-container));

    .collapse-btn {
      display: flex;
      position: absolute;
      bottom: 0;
      left: 8px;
      align-items: center;
      width: 100%;
      height: 40px;
      border-top: 1px solid var(--jcode-color-border-collapse-top-sider, transparent);
      border-bottom: 1px solid var(--jcode-color-border-collapse-bottom-sider, transparent);
    }

    // 侧栏菜单透明，直接透出整屏背景图
    .lr-menu,
    .lr-menu-dark,
    .lr-menu-vertical,
    .lr-menu-horizontal {
      background-color: transparent;
    }

    .lr-menu .lr-menu-item,
    .lr-menu-dark .lr-menu-item,
    .lr-menu-vertical .lr-menu-item {
      background-color: transparent;
    }

    .lr-menu .lr-menu-item:hover .lr-menu-item-content,
    .lr-menu-dark .lr-menu-item:hover .lr-menu-item-content {
      background-color: var(--jcode-color-hover-bg, var(--color-fill-secondary));
      color: var(--color-primary);

      .lr-icon {
        color: var(--color-primary) !important;
      }
    }

    .lr-menu-vertical .lr-menu-item:hover .lr-menu-item-content {
      background-color: var(--jcode-color-hover-bg, var(--color-fill-secondary));
      color: var(--color-primary);

      .lr-icon {
        color: #fff !important;
      }
    }

    .lr-menu-vertical .lr-menu-item .lr-menu-item-content {
      color: var(--color-text-medium);
    }

    .lr-menu-vertical .lr-menu-item .lr-menu-item-content.active,
    .lr-menu-vertical .lr-menu-item .lr-menu-item-content.p-active {
      color: var(--color-primary);
    }
  }

  .jcode-min-side-menu {
    & > .ant-menu-item,
    & > .ant-menu-submenu > .ant-menu-submenu-title {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      margin: 0;
      padding: 0;
      transition: background-color 0.3s;
      background-color: transparent;

      & > .ant-menu-title-content {
        margin: 0 !important;
      }

      & > .ant-menu-submenu-arrow {
        display: none;
      }

      & > .lr-icon {
        width: 48px !important;
        height: 48px !important;
        border-radius: 4px;

        .iconify {
          width: 28px;
          height: 28px;
        }
      }
    }

    & > .ant-menu-item:nth-of-type(7n + 1),
    & > .ant-menu-submenu:nth-of-type(7n + 1) > .ant-menu-submenu-title {
      & > .lr-icon {
        background-color: var(--color-primary);
      }
    }

    & > .ant-menu-item:nth-of-type(7n + 2),
    & > .ant-menu-submenu:nth-of-type(7n + 2) > .ant-menu-submenu-title {
      & > .lr-icon {
        background-color: var(--color-error);
      }
    }

    & > .ant-menu-item:nth-of-type(7n + 3),
    & > .ant-menu-submenu:nth-of-type(7n + 3) > .ant-menu-submenu-title {
      & > .lr-icon {
        background-color: var(--color-warning);
      }
    }

    & > .ant-menu-item:nth-of-type(7n + 4),
    & > .ant-menu-submenu:nth-of-type(7n + 4) > .ant-menu-submenu-title {
      & > .lr-icon {
        background-color: var(--color-success);
      }
    }

    & > .ant-menu-item:nth-of-type(7n + 5),
    & > .ant-menu-submenu:nth-of-type(7n + 5) > .ant-menu-submenu-title {
      & > .lr-icon {
        background-color: var(--color-primary-active);
      }
    }

    & > .ant-menu-item:nth-of-type(7n + 6),
    & > .ant-menu-submenu:nth-of-type(7n + 6) > .ant-menu-submenu-title {
      & > .lr-icon {
        background-color: var(--color-warning-active);
      }
    }

    & > .ant-menu-item:nth-of-type(7n + 7),
    & > .ant-menu-submenu:nth-of-type(7n + 7) > .ant-menu-submenu-title {
      & > .lr-icon {
        background-color: var(--color-success-active);
      }
    }
  }
</style>
