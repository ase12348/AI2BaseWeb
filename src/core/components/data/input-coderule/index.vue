<template>
  <a-input :size="size" readonly :value="inputValue" />
</template>

<script lang="ts" setup>
  import { PropType, ref, computed, watch } from 'vue';
  import { isNullOrEmpty, buildUUID } from '@/core/utils/jcode';
  import { t } from '@/core/locales/setupI18n';

  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    modelValue: {
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
    code: String,
    /**
     * @zh 是否关联多组件
     */
    isCondition: Boolean,
    /**
     * @zh 关联值
     */
    codeKey: {
      type: [String, Number],
      default: '',
    },
    /**
     * @zh 关联项
     */
    options: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 关联表字段值
     */
    relationValue: {
      type: String,
      default: '',
    },
  });
  const emit = defineEmits(['update:modelValue', 'change']);

  const myValue = ref<string | undefined>('');
  const inputValue = computed({
    get() {
      if (isNullOrEmpty(myValue.value) || myValue.value?.indexOf('jcode_code_') != -1) {
        return t('保存时生成');
      }
      return myValue.value;
    },
    set(val) {
      emit('update:modelValue', val);
    },
  });

  const handleChange = (value: string) => {
    emit('update:modelValue', value);
    emit('change', { value });
  };
  const getCodeValue = () => {
    if (!props.isCondition) {
      return props.code;
    } else {
      const myOptions = props.options || [];
      const option = myOptions.find((t: any) => t.codeIdValue === props.relationValue);

      if (option) {
        return option.code;
      }
      return '';
    }
  };

  watch(
    () => props.modelValue,
    (val) => {
      if (isNullOrEmpty(val) && !props.readonly) {
        const code = getCodeValue();
        myValue.value = `jcode_code_${code}|${buildUUID()}${props.isCondition ? (props.relationValue ? '|' + props.relationValue : '') : ''}`;
        handleChange(myValue.value);
      }
      myValue.value = val;
    },
    { immediate: true },
  );

  watch(
    () => props.codeKey,
    () => {
      if (
        !props.isCondition &&
        !props.readonly &&
        (isNullOrEmpty(myValue.value) || myValue.value?.indexOf('jcode_code_') != -1)
      ) {
        const code = getCodeValue();
        myValue.value = `jcode_code_${code}|${buildUUID()}${props.codeKey ? '|' + props.codeKey : ''}`;
        handleChange(myValue.value);
      }
    },
  );

  watch(
    () => props.relationValue,
    () => {
      if (
        !props.readonly &&
        (isNullOrEmpty(myValue.value) || myValue.value?.indexOf('jcode_code_') != -1)
      ) {
        const code = getCodeValue();
        myValue.value = `jcode_code_${code}|${buildUUID()}${props.relationValue ? '|' + props.relationValue : ''}`;
        handleChange(myValue.value);
      }
    },
  );
</script>
