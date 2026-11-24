<template>
  <a-config-provider
    :theme="{
      components: {
        Button: {
          colorBgTextHover: themeToken.jcode_colorBgBtnCollapse,
        },
      },
    }"
  >
    <lr-button type="text" :block="block" :class="{ isBtnBlock: block }" @click="handleClick">
      <template #icon>
        <lr-icon
          :size="18"
          :color="themeToken.jcode_colorTextCollapse"
          :icon="
            appStore.menuCollapsed
              ? 'ant-design:menu-unfold-outlined'
              : 'ant-design:menu-fold-outlined'
          "
        />
      </template>
    </lr-button>
  </a-config-provider>
</template>
<script lang="ts" setup>
  import { inject } from 'vue';
  import { useAppStore } from '/@/core/store/modules/app';

  defineProps({
    block: Boolean,
  });
  const appStore = useAppStore();

  const handleClick = () => {
    appStore.setMenuCollapsed();
  };

  // 主题设置
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);
</script>
<style lang="less">
  .isBtnBlock {
    width: 100%;
    height: 100%;

    .ant-btn {
      width: 100%;
      height: 100%;
      border-radius: 0;
    }
  }
</style>
