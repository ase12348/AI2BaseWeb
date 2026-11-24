<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { api as roleApi } from '@/core/modules/organization/api/role';
  import type { ColumnType } from '/#/page';

  let roleId = '';

  const props = defineProps({
    isMultiSelect: {
      type: Boolean,
      default: true,
    },
  });

  const columns: ColumnType[] = [
    { label: '编号', prop: 'f_EnCode', minWidth: 110, isKeyword: true },
    { label: '名称', prop: 'f_FullName', minWidth: 120, isKeyword: true },
    {
      label: '分类',
      prop: 'f_Category',
      width: 140,
      align: 'center',
      config: {
        dataType: 'dataItem',
        dataCode: 'rolecategory',
      },
    },
  ];

  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
  const resetData = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.resetData();
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
            title: '角色分类',
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                dataType: 'dataItem',
                dataCode: 'rolecategory',

                click: async (node) => {
                  roleId = node[0];
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
            columns: columns,
            mode: 'client',
            rowKey: 'f_RoleId',
            isRadio: !props.isMultiSelect,
            isMultiSelect: props.isMultiSelect,
            isSaveSelectData: true,
            buttons: [],
            tableButtons: [],
            immediate: true,
            loadData: async () => {
              let res = await roleApi.getList();
              if (roleId) {
                res = res.filter((t) => t.f_Category == roleId);
              }
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
  const open = () => {
    resetData();
  };
  const ok = async () => {
    const tableRef = getRef('mainTable');
    const list = await tableRef.getSelections();
    return list;
  };
  defineExpose({
    open,
    closed,
    ok,
  });
</script>
