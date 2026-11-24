<template>
  <lr-input-layer
    v-model:value="value"
    :icon="value || ''"
    :placeholder="placeholder"
    :size="size"
    :readonly="readonly"
    :clearable="clearable"
    valueKey="f_Code"
    labelKey="f_Code"
    :columns="columns"
    :is-page="true"
    sidx="f_ModifyDate DESC"
    :loadLayerData="loadData"
    :onlyButton="onlyButton"
    @change="handleChange"
  />
</template>
<script lang="ts" setup>
  import type { ColumnType } from '/#/page';
  import { computed, h } from 'vue';
  import { Icon } from '@/core/components/ui';
  import { api } from '/@/core/modules/data/api/icon';

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
      default: '请选择图标',
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
    /**
     * @zh 只显示按钮
     */
    onlyButton: Boolean,
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
    {
      label: '名称',
      prop: 'f_Name',
      minWidth: 200,
      isKeyword: true,
      config: {
        formatter: ({ row }) => {
          return h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
              },
            },
            [
              h(Icon, {
                icon: row.f_Code,
                style: {
                  marginRight: '4px',
                },
              }),
              h('span', {}, row.f_Name),
            ],
          );
        },
      },
    },
    { label: '编码', prop: 'f_Code', minWidth: 200, isKeyword: true },
    {
      label: '分类',
      prop: 'f_Category',
      width: 140,
      align: 'center',
      isFilter: true,
      config: { dataType: 'dataItem', dataCode: 'systemIcon' },
    },
  ];

  const loadData = async (param) => {
    const res = await api.getPage(param);
    return res;
  };
</script>
