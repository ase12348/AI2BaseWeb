<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { api as companyApi } from '@/core/modules/organization/api/company';
  import { api as departmentApi } from '@/core/modules/organization/api/department';
  import type { ColumnType } from '/#/page';

  let companyId = '';

  const props = defineProps({
    isMultiSelect: {
      type: Boolean,
      default: true,
    },
  });

  const columns: ColumnType[] = [
    { label: '名称', prop: 'f_FullName', minWidth: 150, isKeyword: true },
    { label: '公司', prop: 'f_CompanyId', minWidth: 150, config: { dataType: 'company' } },
    { label: '编码', prop: 'f_EnCode', width: 100 },
  ];

  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
  const resetData = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.resetData();
  };
  const setData = (value) => {
    const map = {};
    value.forEach((t) => {
      map[t] = true;
    });
    const tableRef = getRef('mainTable');
    tableRef.toggleRowSelection(value, true);
  };

  const indexRef = ref();
  const { getRef } = useIndex(indexRef, [
    {
      type: 'lr-layout',
      children: [
        {
          type: 'lr-panel',
          slot: 'left',
          config: {
            title: '公司信息',
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                valueKey: 'f_CompanyId',
                labelKey: 'f_FullName',
                pidKey: 'f_ParentId',

                loadData: async () => {
                  const res = await companyApi.getList();
                  return res;
                },

                click: (node) => {
                  companyId = node[0];
                  refreshTable();
                },
              },
            },
          ],
        },
        {
          id: 'mainTable',
          type: 'lr-table-panel',
          config: {
            mode: 'client',
            columns: columns,
            rowKey: 'f_DepartmentId',
            pidKey: 'f_ParentId',
            isTree: true,
            checkStrictly: true,
            isRadio: !props.isMultiSelect,
            isMultiSelect: props.isMultiSelect,
            buttons: [],
            tableButtons: [],
            immediate: true,
            loadData: async () => {
              const res = await departmentApi.getList(companyId || 'all');
              return res;
            },
          },
        },
      ],
    },
  ]);
  const closed = () => {
    resetData();
  };
  const ok = async () => {
    const tableRef = getRef('mainTable');
    const list = await tableRef.getSelections();
    return list;
  };
  defineExpose({
    closed,
    ok,
    setData,
  });
</script>
