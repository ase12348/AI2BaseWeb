<template>
  <lr-c-schema-index :schemas="indexSchemas" ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColumnType } from '/#/page';
  import { ref, h } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { api as userApi } from '@/core/modules/organization/api/user';

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
    { label: '姓名', prop: 'f_RealName', minWidth: 110, isKeyword: true },
    { label: '账号', prop: 'f_Account', width: 110, isKeyword: true },
    {
      label: '类别',
      prop: 'f_UserType',
      width: 80,
      align: 'center',
      isFilter: true,
      config: { dataType: 'dataItem', dataCode: 'usercategory', filteProp: 'userType' },
    },
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
    { label: '手机', prop: 'f_Mobile', width: 108, isKeyword: true },
    {
      label: '性别',
      prop: 'f_Gender',
      width: 80,
      align: 'center',
      isFilter: true,
      config: {
        filteProp: 'gender',
        options: [
          { label: '男', value: '1' },
          { label: '女', value: '0' },
        ],
        formatter: ({ row }) => {
          return h(
            Tag,
            {
              bordered: false,
              color: row.f_Gender == 1 ? 'processing' : 'error',
            },
            () => (row.f_Gender == 1 ? '男' : '女'),
          );
        },
      },
    },
    {
      label: '人员状态',
      prop: 'f_Type',
      width: 120,
      align: 'center',
      isFilter: true,
      config: {
        filteProp: 'type',
        options: [
          { label: '试用', value: '2' },
          { label: '正式', value: '1' },
          { label: '离职', value: '3' },
        ],
        formatter: ({ row }) => {
          return h(
            Tag,
            {
              bordered: false,
              color:
                row.f_Type == 1 || row.f_Type == undefined
                  ? 'success'
                  : row.f_Type == 2
                    ? 'processing'
                    : 'error',
            },
            () =>
              row.f_Type == 1 || row.f_Type == undefined
                ? '正式'
                : row.f_Type == 2
                  ? '试用'
                  : '离职',
          );
        },
      },
    },
  ];

  const loadData = async (param) => {
    const res = await userApi.getPages(param);
    return res;
  };

  const indexSchemas = ref([
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: columns,
        rowKey: 'f_UserId',
        isPage: true,
        isRadio: !props.isMultiSelect,
        isMultiSelect: props.isMultiSelect,
        sidx: 'F_SortCode ASC,F_CreateDate DESC',
        buttons: [],
        tableButtons: [],
        immediate: true,
        loadData: async (param: any) => {
          const res = await loadData(param);
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
  const setSelections = (ids: string[], selected = true) => {
    indexRef.value.getRef('mainTable').toggleRowSelection(ids, selected);
  };
  defineExpose({
    open,
    closed,
    ok,
    setSelections,
  });
</script>
