<template>
  <a-input-group v-bind="$attrs" style="display: flex; width: 100%" compact>
    <a-input
      :placeholder="$t(placeholder)"
      v-model:value="currentValue"
      :size="size"
      ref="main"
      :allow-clear="readonly ? false : clearable"
      :disabled="readonly"
      v-if="isInput"
    />
    <a-form-item-rest>
      <ColorButton v-model:value="currentValue" />
    </a-form-item-rest>
  </a-input-group>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref } from 'vue';
  import { createNamespace } from '../utils/components';

  import ColorButton from './colorButton.vue';

  defineOptions({ name: createNamespace('inputColor').name });

  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: [String] as PropType<string>,
      default: null,
    },
    /**
     * @zh 占位符
     */
    placeholder: {
      type: String as PropType<string>,
      default: '请选择',
    },
    /**
     * @zh 是否禁用。
     */
    readonly: Boolean,
    /**
     * @zh 选框尺寸
     */
    size: {
      type: String as PropType<'small' | 'large' | 'middle'>,
    },
    /**
     * @zh 是否可以清除
     * @defaultValue true
     */
    clearable: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否显示输入框
     * @defaultValue true
     */
    isInput: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits({
    'update:value': (value: string | undefined) => true,
    /**
     * @zh 数据改变是触发
     */
    change: (data: { value: string | undefined }) => true,
  });

  const myValue = ref();
  const currentValue = computed({
    get() {
      if (props.value === null) {
        return myValue.value;
      }
      return props.value;
    },
    set(val) {
      myValue.value = val;
      emit('update:value', val);
      emit('change', { value: val });
    },
  });
</script>

<style lang="less">
  @import './inputColor';
</style>
