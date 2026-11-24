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
  import { ref, h, computed } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api } from '/@/core/modules/data/api/codeTable';

  const { success } = useMessage();

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

  const refreshTable = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    await tableRef.refreshData();
  };
  const resetData = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
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
        },
      });
    }
    return res;
  });

  const indexSchemas = ref([
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        searchInputList,
        columns: [
          { label: '表名', prop: 'f_TableName', minWidth: 200, isKeyword: true },
          { label: '备注', prop: 'f_Description', minWidth: 200, isKeyword: true },
          {
            label: '状态',
            prop: 'f_State',
            width: 80,
            align: 'center',
            config: {
              formatter: ({ row }) => {
                return h(Switch, {
                  checked: row.f_State === 1,
                  size: 'small',
                });
              },
            },
          },
        ],
        rowKey: 'f_TableName',
        isPage: true,
        sidx: 'F_TableName DESC',
        isRadio: !props.multiple,
        isMultiSelect: props.multiple,
        isSaveSelectData: true,
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
        tableButtons: [
          {
            prop: 'edit',
            label: '更新',
            click: async (row: Record<string, any>) => {
              loading.value = true;
              const postData = {
                tableList: [
                  {
                    name: row.f_TableName,
                    description: row.f_Description,
                  },
                ],
              };
              const res = await api.importTable(props.dbCode || myDbCode.value, postData);
              if (res) {
                success('更新成功');
                refreshTable();
              }
              loading.value = false;
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
      },
    },
  ]);

  const open = () => {
    refreshTable();
  };

  const closed = () => {
    resetData();
  };

  const ok = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    const list = await tableRef.getSelections();
    const res: any[] = [];
    const tableNameList: string[] = [];
    const columnsDic: Record<string, any> = {};
    list.forEach((item: any) => {
      const table = {
        id: item.f_TableName,
        name: item.f_TableName,
        comment: item.f_Description,
        columns: [],
      };
      res.push(table);
      tableNameList.push(item.f_TableName);
      columnsDic[item.f_TableName] = table;
    });
    if (tableNameList.length > 0 && (props.dbCode || myDbCode.value)) {
      const tableList =
        (await api.getList(props.dbCode || myDbCode.value, String(tableNameList))) || [];
      tableList.forEach((item: any) => {
        const table = columnsDic[item.lr_db_codetableEntity.f_TableName];
        if (table) {
          table.columns = item.lr_db_codecolumnsList.map((t: any) => ({
            name: t.f_DbColumnName,
            csType: t.f_CsType,
            isIdentity: t.f_IsIdentity == 1,
            isPrimary: t.f_IsPrimaryKey == 1,
            isNullable: t.f_IsNullable == 1,
            coment: t.f_Description,
          }));
          table.pKey = table.columns
            .filter((t: any) => t.isPrimary)
            .map((t) => t.name)
            .join(',');
        }
      });
    }
    return res;
  };

  defineExpose({
    open,
    closed,
    ok,
  });
</script>
