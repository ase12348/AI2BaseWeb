<template>
  <template v-for="item in componentList" :key="item.id">
    <template v-if="item.type != 'pkey'">
      <a-col :span="item.config.span || 24">
        <lr-drag-component :is-container="item.dragType !== 'component'" :component-data="item">
          <component :is="designItemName" :component-data="item" :global-config="globalConfig" />
        </lr-drag-component>
      </a-col>
    </template>
  </template>
</template>

<script lang="ts" setup>
  import type { DesignComponent } from './interface';
  import { PropType, inject } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('dragList').name });

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
</script>
