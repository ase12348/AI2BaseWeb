<template>
  <lr-c-schema-form ref="formRef" :form-config="{ labelWidth: '72px' }" @change="handleChange" />
</template>
<script lang="ts" setup>
  import type { SchemaConfig } from '../cSchemaForm/interface';
  import type { DbTable } from './interface';
  import { ref, onMounted, PropType, computed } from 'vue';

  const porps = defineProps({
    componentList: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    tableList: {
      type: Array as PropType<DbTable[]>,
      default: () => [],
    },
  });

  const tableOptions = computed(() =>
    porps.tableList.map((item) => ({
      label: item.comment ? `${item.name}(${item.comment})` : item.name,
      value: item.name,
    })),
  );

  const formRef = ref();
  const schemas: SchemaConfig[] = [
    {
      id: 'layout',
      type: 'layout',
      config: { top: 48, topMove: false, autoSize: ['default'] },
      children: [
        {
          id: 'table',
          type: 'select',
          slot: 'top',
          config: { label: '表名选择', loadOptions: () => tableOptions, allowClear: false },
        },
        {
          id: 'fields',
          type: 'gridtable',
          config: {
            isAddBtn: false,
            isRemoveBtn: false,
            height: '100%',
            isMultiSelect: true,
            multiSelectKey: 'selected',
          },
          children: [
            {
              id: 'name',
              type: '',
              config: { label: '字段名' },
            },
            {
              id: 'type',
              type: 'select',
              config: { label: '组件选择', options: porps.componentList, width: 200 },
            },
          ],
        },
      ],
    },
  ];

  const handleChange = (
    component: Record<string, any>,
    params: {
      value: any;
      data?: any;
      index?: number;
      tableData?: Record<string, any>[];
      type?: string;
    },
  ) => {
    if (component.id === 'table') {
      const table = porps.tableList.find((item) => item.name === params.value);
      if (table) {
        const addList = table.columns.map((item) => ({
          value: item.name,
          name: item.coment ? `${item.name}(${item.coment})` : item.name,
          type: 'input',
          label: item.coment || item.name,
          selected: !item.isPrimary,
        }));
        formRef.value.setFormData({ fields: addList });
      }
    }
  };

  onMounted(() => {
    formRef.value.setInit(schemas);
  });

  const ok = () => {
    const formData = formRef.value.getFormData(false);
    const addList = formData.fields.filter((item: any) => item.selected);

    return {
      addList,
      table: formData.table,
      containerId: formData.containerId,
      isSubTable: formData.isSubTable,
    };
  };

  const closed = () => {
    formRef.value.resetFields();
  };

  defineExpose({ ok, closed });
</script>
