<template>
  <component
    :is="componentData?.componentName"
    v-bind="componentData?.config"
    :global-config="globalConfig"
    :component-data="componentData"
  />
</template>

<script lang="ts" setup>
  import type { DesignComponent } from '../drag/interface';
  import { PropType } from 'vue';

  defineOptions({ name: 'LrIndexDesignItem' });

  defineProps({
    /**
     * @zh 配置项
     */
    componentData: {
      type: Object as PropType<DesignComponent>,
      default: () => ({}),
    },
    /**
     * @zh 全局配置
     */
    globalConfig: {
      type: Object,
      default: () => ({}),
    },
  });
</script>
