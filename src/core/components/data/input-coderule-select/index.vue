<template>
  <lr-input-layer
    v-model:value="value"
    icon="code"
    :placeholder="placeholder"
    :size="size"
    :readonly="readonly"
    :clearable="clearable"
    valueKey="f_EnCode"
    labelKey="f_FullName"
    :columns="columns"
    :is-page="true"
    sidx="F_ModifyDate DESC"
    :loadLayerData="loadData"
    :getText="getText"
    @change="handleChange"
  />
</template>
<script lang="ts" setup>
  import type { ColumnType } from '/#/page';
  import { computed } from 'vue';
  import { useCodeRule } from '@/core/hooks/data/useCodeRule';
  import { api } from '/@/core/modules/data/api/coderule';

  const { loadCodeRule, getCodeRule } = useCodeRule();

  const props = defineProps({
    /**
     * 输入值
     */
    modelValue: {
      type: String,
      default: undefined,
    },
    /**
     * 占位符
     */
    placeholder: {
      type: String,
      default: '请选择单据编码',
    },
    /**
     * @zh 选框尺寸
     */
    size: {
      type: String as PropType<'small' | 'large' | 'middle'>,
    },
    /**
     * @zh 是否可以操作
     * @defaultValue false
     */
    readonly: {
      type: Boolean,
      defauly: false,
    },
    /**
     * @zh 是否可以清除
     * @defaultValue true
     */
    clearable: {
      type: Boolean,
      default: true,
    },
  });
  const emit = defineEmits(['update:modelValue', 'change']);

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  const handleChange = (data: any) => {
    console.log(data, 'data');
    emit('change', data);
  };

  const columns: ColumnType[] = [
    { label: '编码', prop: 'f_EnCode', width: 164, isKeyword: true },
    { label: '名称', prop: 'f_FullName', minWidth: 160, isKeyword: true },
    { label: '当前流水号', prop: 'f_CurrentNumber', width: 184 },
  ];

  const loadData = async (param) => {
    const res = await api.getPage(param);
    return res;
  };

  const getText = (value) => {
    console.log(value, 'value');
    loadCodeRule(value);
    const name = getCodeRule.value[value];
    return name;
  };
</script>
