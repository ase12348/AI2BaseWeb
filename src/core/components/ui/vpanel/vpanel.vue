<template>
  <div class="lr-vpanel">
    <slot name="top"></slot>
    <div class="lr-vpanel-main">
      <slot></slot>
    </div>
    <slot name="bottom"></slot>
  </div>
</template>

<script lang="ts" setup>
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('vpanel').name });
</script>

<style lang="less">
  @import './vpanel';
</style>
