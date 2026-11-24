<template>
  <div class="lr-block lr-data-panel">
    <div class="lr-data-panel-header">
      <a-typography-text ellipsis style="margin: 0; font-size: 14px" :content="$t(title || '')" />
      <div class="lr-data-panel-header-right">
        <slot name="titleRight"> </slot>
      </div>
    </div>
    <div class="lr-data-panel-body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('dataPanel').name });
  defineProps({
    /**
     * @zh 标题
     */
    title: {
      type: String as PropType<string>,
    },
  });
</script>

<style lang="less">
  @import './dataPanel';
</style>
