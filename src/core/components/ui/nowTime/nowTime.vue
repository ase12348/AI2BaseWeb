<template>
  <a-input :size="size" readonly :value="myValue">
    <template #suffix> <lr-icon icon="ant-design:calendar-outlined" /> </template>
  </a-input>
</template>

<script lang="ts" setup>
  import { PropType, ref, watch } from 'vue';
  import { createNamespace } from '../utils/components';
  import { isNullOrEmpty } from '../utils/is';
  import { formatToDateTime } from '../utils/date';

  defineOptions({ name: createNamespace('nowTime').name });
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
     * @zh 模式，用于区分编辑人员还是创建人员还是选择框
     */ mode: {
      type: String as PropType<'create' | 'modify'>,
      default: 'create',
    },
    /**
     * @zh 是否编辑状态（相对于新建）,对于编辑人员还是创建人员有用
     */
    isEditState: Boolean,
  });
  const emit = defineEmits({
    'update:value': (val: string) => true,
    /**
     * @zh 数据值改变的时候调用
     * @param data
     */
    change: (data: { value: string }) => true,
  });

  const myValue = ref<string | undefined>('');

  const handleChange = (value: string) => {
    emit('update:value', value);
    emit('change', { value });
  };

  watch(
    () => props.value,
    (val) => {
      if ((isNullOrEmpty(val) || props.mode === 'modify') && !props.readonly) {
        if ((props.mode === 'create' && !props.isEditState) || props.mode === 'modify') {
          myValue.value = formatToDateTime();
          handleChange(myValue.value);
          return;
        }
      }
      myValue.value = val;
    },
    { immediate: true },
  );
</script>

<style lang="less">
  @import './nowTime';
</style>
