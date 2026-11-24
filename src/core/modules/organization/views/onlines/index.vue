<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';

  import { api } from '../../api/user';
  import pageInfo from './page';
  import { ref } from 'vue';

  const { getColumns } = useAuth(pageInfo);

  const columnsConfig: Record<string, ColConfig> = {};

  const indexRef = ref();
  useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: getColumns(columnsConfig),
        rowKey: 'loginRandomCode',
        isPage: true,
        immediate: true,
        loadData: async (param) => {
          const res = await api.getOnlines(param);
          return res;
        },
      },
    },
  ]);
</script>
