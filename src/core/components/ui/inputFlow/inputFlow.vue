<template>
  <lr-input-button
    :type="type"
    :btn-text="btnShowText"
    :title="title"
    :size="size"
    :width="width"
    :height="height"
    :before-close="handleBeforeClose"
    :ok="handleOk"
    :open="handleOpen"
    destroy-on-close
    v-model:value="inputValue"
    @change="handleChange"
  >
    <div class="lr-block lr-input-flow">
      <lr-flow-design
        ref="flowRef"
        :components="flowComponents"
        :flow-init="flowInit"
        :flow-component-config-init="flowComponentConfigInit"
        :flow-component-configs="flowComponentConfigs"
        :flow-component-config-change="flowComponentConfigChange"
        :input-params="inputParams"
      />
    </div>
  </lr-input-button>
</template>

<script lang="ts" setup>
  import type { SchemaConfig } from '../cSchemaForm/interface';
  import { PropType, ref, computed } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('inputFlow').name });

  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: [String] as PropType<string>,
      default: undefined,
    },
    /**
     * @zh 按钮的类型，分为五种：主要按钮、幽灵按钮、虚框按钮、链接按钮、文字按钮、次要按钮。
     * @defaultValue 'default'
     */
    type: {
      type: String as PropType<'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default'>,
    },
    /**
     * @zh 按钮文字
     */
    btnText: {
      type: String,
      default: '事件',
    },
    /**
     * @zh 弹窗标题
     */
    title: String,
    /**
     * @zh 设置按钮大小
     * @defaultValue 'middle'
     */
    size: {
      type: String as PropType<'large' | 'middle' | 'small'>,
    },
    /**
     * @zh 宽度
     * @defaultValue 1000
     */
    width: {
      type: [String, Number],
      default: 1200,
    },
    /**
     * @zh 高度
     * @defaultValue 600
     */
    height: {
      type: Number,
      default: 800,
    },
    /**
     * @zh 弹窗关闭前回调
     */
    beforeClose: Function,

    /**
     * @zh 组件集合
     */
    flowComponents: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 输入参数
     */
    inputParams: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },

    /**
     * @zh 编排组件初始化方法
     */
    flowInit: Function,
    /**
     * @zh 组件配置初始化方法
     */
    flowComponentConfigInit: Function,
    /**
     * @zh 编排组件设置方法
     */
    flowComponentConfigs: {
      type: Object as PropType<Record<string, SchemaConfig[]>>,
      default: () => ({}),
    },
    /**
     * @zh 配置值变更方法
     */
    flowComponentConfigChange: Function,
  });

  const emit = defineEmits({
    'update:value': (val: string | undefined) => true,
    /**
     * @zh 值变化时触发
     */
    change: (data: { value: string | undefined }) => true,
  });

  const inputValue = computed({
    set: (val) => {
      emit('update:value', val);
    },
    get: () => props.value,
  });

  const handleOpen = (code: string) => {
    flowRef.value?.setData(JSON.parse(code || '[]'));
  };

  const handleOk = () => JSON.stringify(flowRef.value?.getData());

  const handleBeforeClose = (code: string) => {
    if (props.beforeClose) {
      return props.beforeClose(code);
    }
    return true;
  };
  const handleChange = (data: any) => {
    emit('change', data);
  };

  const btnShowText = computed(() => {
    if (props.value && props.value.trim()) {
      return `${props.btnText}`;
    }
    return props.btnText;
  });

  const flowRef = ref();
</script>

<style lang="less">
  @import './inputFlow';
</style>
