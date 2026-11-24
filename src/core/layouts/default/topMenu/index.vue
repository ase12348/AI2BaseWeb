<template>
  <div :class="prefixCls">
    <lr-menu
      :mode="getTheme.topMenuMode || 'horizontal'"
      :theme="getTheme.topMenuTheme"
      :meuns="menusTree"
      :activeId="selectedKeys"
      @click="handleClick"
    />
  </div>
</template>
<script lang="ts" setup>
  import { unref, computed } from 'vue';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { useAppSetting } from '/@/core/hooks/setting/useAppSetting';

  const { options } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-layout-top-menu`;

  const { getMemuType, getTheme } = useAppSetting();
  // 菜单设置horizontal

  const { getTopMenus, getMenuTree, topCurrentMenu, openMenu, currentMenu } = useMenu();

  // 混合布局顶部只放一级菜单（二级交给侧栏），顶部布局放整棵树
  const menusTree = computed(() => {
    if (['mix'].includes(getMemuType.value)) {
      return unref(getTopMenus);
    } else {
      return unref(getMenuTree);
    }
  });
  const selectedKeys = computed(() => {
    if (['mix'].includes(getMemuType.value)) {
      return unref(topCurrentMenu);
    } else {
      return currentMenu.value?.f_ModuleId;
    }
  });

  const handleClick = ({ value }) => {
    openMenu(value, ['mix'].includes(getMemuType.value));
  };
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-layout-top-menu';

  .@{prefix-cls} {
    position: relative;
    width: 100%;
  }

  .lr-menu-item:hover .lr-menu-item-content {
    color: var(--color-primary) !important;

    .lr-menu-item-icon {
      color: var(--color-primary) !important;
    }
  }
</style>
