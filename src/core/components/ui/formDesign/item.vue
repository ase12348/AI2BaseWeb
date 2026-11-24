<template>
  <a-form-item
    v-if="componentData.isInput"
    :label-col="{
      style: { width: labelWidth },
    }"
    :label="$t(componentData.config?.label || '')"
    :rules="componentData.config?.required ? [{ required: true, message: '' }] : []"
  >
    <lr-c-input
      :type="componentData?.componentName || componentData?.type"
      :config="inputConfig"
      :model-value="componentData?.config.defaultValue"
    />
  </a-form-item>
  <component
    v-else-if="componentData?.children"
    :is="componentData?.componentName"
    v-bind="componentData?.config"
    :global-config="globalConfig"
    :component-data="componentData"
  />
  <component v-else :is="componentData?.componentName" v-bind="componentData?.config" />
</template>

<script lang="ts" setup>
  import type { DesignComponent } from '../drag/interface';
  import { PropType, computed } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('formDesignItem').name });

  const props = defineProps({
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

  const labelWidth = computed(() => {
    if (props.componentData.config?.notLabel) {
      return '0px';
    }

    if (
      props.componentData.config?.labelWidth === undefined &&
      props.globalConfig.labelWidth !== undefined
    ) {
      return `${props.globalConfig.labelWidth}px`;
    }

    return props.componentData.config?.labelWidth
      ? `${props.componentData.config?.labelWidth}px`
      : undefined;
  });

  const inputConfig = computed(() => {
    const res = { ...props.componentData?.config };

    if (props.globalConfig.size === undefined) {
      res.size = props.globalConfig.size;
    }

    return res;
  });
</script>
