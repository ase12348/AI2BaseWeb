<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}-left`">
      <!-- logo -->
      <lr-app-logo :class="`${prefixCls}-logo`" />
    </div>
    <div v-if="['mix', 'top'].includes(getMemuType)" :class="`${prefixCls}-mid`">
      <TopMenu />
    </div>
    <div :class="`${prefixCls}-right`">
      <lr-language-type inHeader />
      <lr-user-posts />
      <lr-chat-btn />
      <lr-message-btn />
      <lr-full-screen-btn />
      <lr-user-dropdown />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import TopMenu from '../topMenu/index.vue';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useAppSetting } from '/@/core/hooks/setting/useAppSetting';

  const { options } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-layout-header`;

  const { getMemuType } = useAppSetting();
</script>
<style lang="less">
  @import url('./index.less');
</style>
