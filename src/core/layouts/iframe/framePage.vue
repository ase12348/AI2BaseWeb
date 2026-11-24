<template>
  <div :class="prefixCls">
    <iframe :src="frameSrc" :class="`${prefixCls}__main`"></iframe>
  </div>
</template>
<script lang="ts" setup>
  import { propTypes } from '/@/core/utils/propTypes';

  import { useGlobSetting } from '/@/core/hooks/setting';

  defineProps({
    frameSrc: propTypes.string.def(''),
  });

  const { options } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-iframe-page`;
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-iframe-page';

  .@{prefix-cls} {
    position: relative;
    width: 100%;
    height: 100%;

    &__main {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 0;
    }
  }
</style>
