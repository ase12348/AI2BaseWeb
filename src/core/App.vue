<template>
  <a-config-provider :locale="antdLocale" :theme="themeConfig">
    <lr-app-provider>
      <div class="jcode-app-loading">
        <span class="jcode-app-loading-dot"><i></i><i></i><i></i><i></i></span>
        <div class="jcode-app-loading-title" style="font-size: 18px">{{
          `${$t('加载成功')},${$t('页面渲染中')}...`
        }}</div>
      </div>
      <RouterView
    /></lr-app-provider>
  </a-config-provider>
</template>

<script lang="ts" setup>
  import { useTitle } from '@/core/hooks/useTitle';
  import { useTheme } from '@/core/hooks/setting/useTheme';
  import { useLanguage } from '/@/core/hooks/setting/useLanguage';

  const { antdLocale } = useLanguage();
  const { themeConfig } = useTheme();
  // console.log(themeConfig, 'themeConfig');
  useTitle();
</script>
