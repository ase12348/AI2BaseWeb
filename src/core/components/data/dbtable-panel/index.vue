<template>
  <lr-c-schema-index
    style="background-color: var(--color-bg-layout)"
    :schemas="indexSchemas"
    ref="indexRef"
  />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api } from '/@/core/modules/data/api/dbtable';
  import { api as codeTableApi } from '/@/core/modules/data/api/codeTable';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();

  const indexRef = ref();
  const dbCode = ref('');

  const refreshTable = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    await tableRef.refreshData();
  };
  const resetData = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    await tableRef.resetData();
  };

  const indexSchemas = ref([
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        mode: 'client',
        columns: [
          { label: '表名', prop: 'name', minWidth: 200, isKeyword: true },
          { label: '说明', prop: 'description', minWidth: 200, isKeyword: true },
        ],
        rowKey: 'name',
        isPage: true,
        isRadio: false,
        isMultiSelect: true,
        isSaveSelectData: true,
        immediate: false,
        loadData: async () => {
          let res = api.getImportableTables(dbCode.value);
          return res;
        },
      },
    },
  ]);

  const open = (param) => {
    dbCode.value = param.dbCode;
    refreshTable();
  };

  const closed = () => {
    resetData();
  };

  const ok = async () => {
    const tableRef = indexRef.value.getRef('mainTable');
    const list = await tableRef.getSelections();
    if (list.length > 0) {
      const res = await codeTableApi.importTable(dbCode.value, {
        tableList: list,
      });
      if (res) {
        success(t('导入成功'));
        return true;
      }
    }
  };

  defineExpose({
    open,
    closed,
    ok,
  });
</script>
