<template>
  <lr-c-schema-index :schemas="indexSchemas" ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColumnType } from '/#/page';
  import { ref } from 'vue';
  import { api as postApi } from '@/core/modules/organization/api/post';

  const indexRef = ref();
  const props = defineProps({
    isMultiSelect: {
      type: Boolean,
      default: true,
    },
  });
  const resetData = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    await tableRef.resetData();
  };

  const columns: ColumnType[] = [
    { label: '姓名', prop: 'f_Name', minWidth: 110 },
    { label: '编号', prop: 'f_EnCode', width: 110 },
    {
      label: '公司',
      prop: 'f_CompanyId',
      width: 120,
      isFilter: true,
      config: {
        filteProp: 'companyId',
        dataType: 'company',
      },
    },
    {
      label: '部门',
      prop: 'f_DepartmentId',
      width: 140,
      isFilter: true,
      config: {
        dataType: 'department',
        filteProp: 'departmentId',
        upId: 'f_CompanyId',
      },
    },
  ];

  const indexSchemas = ref([
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: columns,
        rowKey: 'f_PostId',
        pidKey: 'f_ParentId',
        isTree: true,
        checkStrictly: true,
        isRadio: !props.isMultiSelect,
        isMultiSelect: props.isMultiSelect,
        isSaveSelectData: true,
        buttons: [],
        tableButtons: [],
        immediate: true,
        loadData: async (param: any) => {
          const res = await postApi.getList(param);
          return res;
        },
      },
    },
  ]);
  const closed = () => {
    resetData();
  };
  const open = () => {
    resetData();
  };

  const ok = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    const list = await tableRef.getSelections();
    return list;
  };
  defineExpose({
    open,
    closed,
    ok,
  });
</script>
