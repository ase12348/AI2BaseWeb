<template>
  <div :class="[{ 'lr-quick-bi-design_app-viewer': isApp }]">
    <grid-layout
      :col-num="120"
      :row-height="1"
      :is-draggable="false"
      :is-resizable="false"
      :is-mirrored="false"
      :vertical-compact="true"
      :use-css-transforms="true"
      :layout="layout"
    >
      <grid-item
        v-for="item in layout"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :key="item.i"
        :max-h="item.maxH"
        :min-h="item.minH"
        :max-w="item.maxW"
        :min-w="item.minW"
      >
        <component :is="item.componentName" v-bind="item.config" :is-preview="isPreview" />
      </grid-item>
    </grid-layout>
  </div>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';

  import { createNamespace } from '../utils/components';
  import { Layout } from './interface';

  defineOptions({ name: createNamespace('quickBiViewer').name });
  defineProps({
    layout: {
      type: Array as PropType<Layout>,
      default: () => [],
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    isApp: {
      type: Boolean,
      default: false,
    },
  });
</script>

<style lang="less">
  @import './quickBiDesign';
</style>
