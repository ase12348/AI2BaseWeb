<template>
  <a-config-provider
    :theme="{
      components: {
        Button: {
          colorBgTextHover: themeToken.jcode_colorBgBtnHeader,
        },
      },
    }"
  >
    <a-tooltip placement="top" :title="isFullscreen ? $t('退出全屏') : $t('全屏')">
      <lr-button class="jcode-header-btn" type="text" @click="toggle">
        <template #icon>
          <lr-icon
            :size="18"
            :color="themeToken.jcode_colorTextBtnHeader"
            :icon="
              isFullscreen
                ? 'ant-design:fullscreen-exit-outlined'
                : 'ant-design:fullscreen-outlined'
            "
          />
        </template>
      </lr-button>
    </a-tooltip>
  </a-config-provider>
</template>
<script lang="ts" setup>
  import { inject } from 'vue';
  import { useFullscreen } from '@vueuse/core';

  const { toggle, isFullscreen } = useFullscreen();

  // 主题设置
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);
</script>
