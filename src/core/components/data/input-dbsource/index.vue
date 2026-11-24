<template>
  <lr-input-layer
    v-model:value="value"
    icon="table"
    :placeholder="placeholder"
    :size="size"
    :readonly="readonly"
    :clearable="clearable"
    :valueKey="valueKey"
    :labelKey="labelKey"
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
  import { useDbSource } from '@/core/hooks/data/useDbSource';
  import { api } from '/@/core/modules/data/api/dbsource';

  const { loadSetting, getSetting, loadDbSourceAll, getDbSourceAll } = useDbSource();

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
      default: '请选择数据视图',
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
    valueKey: {
      type: String,
      default: 'f_Code',
    },
    labelKey: {
      type: String,
      default: 'f_Name',
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
    emit('change', data);
  };

  const columns: ColumnType[] = [
    { label: '编码', prop: 'f_Code', minWidth: 150, isKeyword: true },
    { label: '名称', prop: 'f_Name', minWidth: 150, isKeyword: true },
    {
      label: '分类',
      prop: 'f_Category',
      width: 120,
      isFilter: true,
      config: {
        filteProp: 'category',
        dataType: 'dataItem',
        dataCode: 'datasourceType',
      },
    },
  ];

  const loadData = async (param) => {
    const res = await api.getPage(param);
    return res;
  };

  const getText = (value) => {
    if (props.valueKey === 'f_Id') {
      loadDbSourceAll();
      return (getDbSourceAll.value?.find((t) => t.f_Id == value) || {})[props.labelKey] || value;
    }
    loadSetting(value);
    const entity = getSetting.value[value];
    return entity?.[props.labelKey] || value;
  };
</script>
