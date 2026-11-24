<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref, computed, nextTick } from 'vue';
  import { api } from '/@/core/modules/data/api/dbsource';

  const code = ref('');
  const columns = ref([]);
  const columnsShow = computed(() => {
    const res: any[] = [];
    columns.value.forEach((column: any) => {
      res.push({
        label: column.label,
        prop: column.prop,
        minWidth: 160,
      });
    });
    return res;
  });

  const indexRef = ref();

  const fetchColums = async () => {
    columns.value = await api.getColumns(code.value);
  };

  const refreshTable = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    await tableRef.refreshData();
  };

  const open = async (param) => {
    code.value = param.code;
    await fetchColums();

    indexRef.value.setInit([
      {
        id: 'mainTable',
        type: 'lr-table-panel',
        config: {
          columns: columnsShow.value,
          buttons: [],
          tableButtons: [],
          immediate: false,
          isPage: true,
          loadData: async (params) => {
            const res = await api.getDataPage(code.value, params);
            return res || [];
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
