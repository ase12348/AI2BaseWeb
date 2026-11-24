<template>
  <div class="lr-block" style="padding: 24px; overflow: auto; overflow-x: hidden">
    <div class="lr-page-panel">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('pagePanel').name });
</script>

<style lang="less">
  @import './pagePanel';
</style>
