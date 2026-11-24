<template>
  <template v-for="item in componentList" :key="item.id">
    <lr-drag-component
      :style="componentStyle(item.config)"
      :is-container="item.dragType !== 'component'"
      :component-data="item"
    >
      <component :is="designItemName" :component-data="item" :global-config="globalConfig" />
    </lr-drag-component>
  </template>
</template>

<script lang="ts" setup>
  import type { DesignComponent } from './interface';
  import { PropType, inject } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('dragIndexList').name });

  defineProps({
    /**
     * @zh 配置项
     */
    componentList: {
      type: Array as PropType<DesignComponent[]>,
      default: () => [],
    },
    /**
     * @zh 全局配置
     */
    globalConfig: {
      type: Object,
      default: () => ({}),
    },
  });

  const { designItemName } = inject('jcode-design-provide', {} as Record<string, any>);
  const componentStyle = (config: Record<string, any>) => {
    if (config.flexWidth) {
      return { width: config.flexWidth + '%' };
    }
  };
</script>
