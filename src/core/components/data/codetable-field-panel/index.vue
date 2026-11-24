<template>
  <a-spin :spinning="loading">
    <lr-c-schema-index
      style="background-color: var(--color-bg-layout)"
      :schemas="indexSchemas"
      ref="indexRef"
    />
  </a-spin>
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref, computed } from 'vue';
  import { api } from '/@/core/modules/data/api/codeTable';

  const props = defineProps({
    multiple: {
      type: Boolean,
      default: true,
    },
    dbCode: String,
  });
  const indexRef = ref();
  const loading = ref(false);
  const myDbCode = ref('');
  const selectRow = ref<Record<string, any>>({});

  const refreshTable = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    await tableRef.refreshData();
  };
  const refreshFieldTable = async () => {
    const tableRef = indexRef.value.getRef('fieldTable');
    await tableRef.refreshData();
  };
  const resetFieldData = async () => {
    const tableRef = indexRef.value.getRef('fieldTable');
    await tableRef.resetData();
  };

  const openForm = (data: any) => {
    indexRef.value.openForm(data);
  };

  const searchInputList = computed(() => {
    const res: FormSchemaConfig[] = [];
    if (!props.dbCode) {
      res.push({
        id: 'dbCode',
        type: 'lr-input-dblink',
        config: {
          isQuickSearch: true,
          defaultValue: 'lrsystemdb',
          immediate: true,
        },
      });
    }
    return res;
  });

  const indexSchemas = ref([
    {
      type: 'lr-layout',
      config: {
        left: 490,
      },
      children: [
        {
          type: 'lr-panel',
          slot: 'left',
          config: {
            bodyStyle: {
              padding: 0,
            },
          },
          children: [
            {
              id: 'mainTable',
              type: 'lr-table-panel',
              config: {
                searchInputList,
                columns: [
                  { label: '表名', prop: 'f_TableName', isKeyword: true },
                  { label: '说明', prop: 'f_Description', isKeyword: true },
                ],
                rowKey: 'f_TableName',
                isPage: true,
                sidx: 'F_TableName DESC',
                isSaveSelectData: true,
                isSetTable: false,
                buttons: [
                  {
                    prop: 'import',
                    label: '导入表',

                    click: () => {
                      openForm({
                        title: '导入表',
                        btnText: '确认',
                        name: 'lr-dbtable-panel',
                        param: { dbCode: props.dbCode || myDbCode.value },
                        width: 800,
                        height: 600,
                        afterOk: () => {
                          refreshTable();
                        },
                      });
                    },
                  },
                ],
                immediate: false,
                loadData: async (param: any) => {
                  if (props.dbCode) {
                    param.dbCode = props.dbCode;
                  }
                  myDbCode.value = param.dbCode;
                  if (param.dbCode) {
                    param.f_State = 1;
                    let res = await api.getPage(param);
                    return res;
                  }

                  return [];
                },
                rowClick: async ({ row }) => {
                  selectRow.value = row;
                  refreshFieldTable();
                },
              },
            },
          ],
        },
        {
          id: 'fieldTable',
          type: 'lr-table-panel',
          config: {
            columns: [
              { prop: 'f_DbColumnName', label: '名称', minWidth: 120 },
              { prop: 'f_Description', label: '备注', minWidth: 120 },
            ],
            rowKey: 'f_Id',
            isRadio: !props.multiple,
            isMultiSelect: props.multiple,
            isSaveSelectData: true,
            immediate: false,
            isSetTable: false,
            loadData: async () => {
              if (selectRow.value?.f_Id) {
                // @ts-ignore
                return (await api.get(selectRow.value.f_Id))?.lr_db_codecolumnsList || [];
              }
              return [];
            },
          },
        },
      ],
    },
  ]);

  const open = () => {
    refreshTable();
    refreshFieldTable();
  };

  const closed = () => {
    resetFieldData();
  };

  const ok = async () => {
    const tableRef = indexRef.value.getRef('fieldTable');
    const list = await tableRef.getSelections();
    return list;
  };

  defineExpose({
    open,
    closed,
    ok,
  });
</script>
