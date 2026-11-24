<template>
  <div class="lr-hpanel">
    <slot name="left"></slot>
    <div class="lr-hpanel-main">
      <slot></slot>
    </div>
    <slot name="right"></slot>
  </div>
</template>

<script lang="ts" setup>
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('hpanel').name });
</script>

<style lang="less">
  @import './hpanel';
</style>
