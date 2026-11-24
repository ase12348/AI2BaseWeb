<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColumnType } from '/#/page';
  import { ref } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { api as companyApi } from '@/core/modules/organization/api/company';

  const props = defineProps({
    isMultiSelect: {
      type: Boolean,
      default: true,
    },
  });

  const columns: ColumnType[] = [
    { label: '名称', prop: 'f_FullName', minWidth: 260, isKeyword: true },
    { label: '编码', prop: 'f_EnCode', minWidth: 150, isKeyword: true },
  ];

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
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        mode: 'client',
        columns: columns,
        rowKey: 'f_CompanyId',
        pidKey: 'f_ParentId',
        isTree: true,
        checkStrictly: true,
        isRadio: !props.isMultiSelect,
        isMultiSelect: props.isMultiSelect,
        isSaveSelectData: true,
        buttons: [],
        tableButtons: [],
        immediate: true,
        loadData: async () => {
          const res = await companyApi.getList();
          return res;
        },
      },
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
