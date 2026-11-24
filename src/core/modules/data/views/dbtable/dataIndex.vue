<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref, computed, nextTick } from 'vue';
  import { api } from '/@/core/modules/data/api/dbtable';

  const dbCode = ref('');
  const tableName = ref('');
  const columns = ref([]);
  const columnsShow = computed(() => {
    const res: any[] = [];
    columns.value.forEach((column: any) => {
      res.push({
        label: column.dbColumnName,
        prop: column.dbColumnName.toLowerCase(),
        minWidth: 160,
      });
    });
    return res;
  });

  const indexRef = ref();

  const fetchColums = async () => {
    columns.value = await api.getColumns(dbCode.value, tableName.value);
  };

  const refreshTable = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    await tableRef.refreshData();
  };

  const open = async (param) => {
    dbCode.value = param.dbCode;
    tableName.value = param.tableName;
    await fetchColums();

    indexRef.value.setInit([
      {
        id: 'mainTable',
        type: 'lr-table-panel',
        config: {
          // mode: 'client',
          columns: columnsShow.value,
          buttons: [],
          tableButtons: [],
          immediate: false,
          isPage: true,
          sidx: columnsShow.value[0].prop,
          loadData: async (param) => {
            let queryData = {
              ...param,

              code: dbCode.value,
              tableName: tableName.value,
            };

            const res = await api.getDataPage(queryData);

            return res;
          },
        },
      },
    ]);

    nextTick(() => {
      refreshTable();
    });
  };

  defineExpose({
    open,
  });
</script>
