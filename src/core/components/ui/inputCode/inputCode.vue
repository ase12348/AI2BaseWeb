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
    v-model:value="inputValue"
    @change="handleChange"
  >
    <lr-layout :right-move="false" :right="560">
      <lr-code-mirror
        :mode="mode"
        v-model:value="codeValue"
        :is-hint="isHint"
        :handle-hint="handleHint"
      />
      <template v-if="example" #right>
        <lr-code-mirror :mode="mode" read-only :value="example" />
      </template>
    </lr-layout>
  </lr-input-button>
</template>

<script lang="ts" setup>
  import { PropType, ref, computed } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('inputCode').name });

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
     * @zh 脚本类型
     */
    mode: {
      type: String,
      default: 'application/json',
    },
    /**
     * @zh 按钮文字
     */
    btnText: {
      type: String,
      default: '设置脚本',
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
      default: 600,
    },
    /**
     * @zh 示例代码
     */
    example: {
      type: String,
      default: '',
    },
    /**
     * @zh 弹窗关闭前回调
     */
    beforeClose: Function,
    /**
     * @zh 是否开启自动补全
     */
    isHint: Boolean,
    /**
     * @zh 自动补全方法
     */
    handleHint: Function,
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
  const codeValue = ref('');

  const handleOpen = (code: string) => {
    codeValue.value = code;
  };

  const handleOk = () => codeValue.value;

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
      return `${props.btnText}(已设置)`;
    }
    return props.btnText;
  });
</script>

<style lang="less">
  @import './inputCode';
</style>
