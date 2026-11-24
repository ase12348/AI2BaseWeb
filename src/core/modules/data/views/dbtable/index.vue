<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { t } from '@/core/locales/setupI18n';
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useDblink } from '/@/core/hooks/data/useDblink';

  import { api as dbtableApi } from '/@/core/modules/data/api/dbtable';
  import DataIndex from './dataIndex.vue';
  import pageInfo from './page';

  const { getDblinkTree, loadDblinkList } = useDblink();

  let dbCode = 'lrsystemdb';

  // 按钮点击事件
  const buttonClick = {
    view: (row) => {
      openForm({
        title: `${t('查看表')}【${row.name}】${t('数据')}`,
        name: h(DataIndex),
        param: { dbCode, tableName: row.name },
        height: 600,
        width: 1000,
        hasBtns: false,
      });
    },
  };

  // 页面权限处理
  const { getButtons, getColumns } = useAuth(pageInfo, { buttonClick });

  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };

  const columnsConfig: Record<string, ColConfig> = {
    isPrimarykey: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.isPrimarykey,
          size: 'small',
          disabled: true,
        });
      },
    },
    isNullable: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.isNullable,
          size: 'small',
          disabled: true,
        });
      },
    },
    isIdentity: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.isIdentity,
          size: 'small',
          disabled: true,
        });
      },
    },
  };

  const indexRef = ref();
  const { getRef, openForm } = useIndex(indexRef, [
    {
      type: 'lr-layout',
      children: [
        {
          type: 'lr-panel',
          slot: 'left',
          config: {
            title: '数据库',
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                valueKey: 'id',
                labelKey: 'label',
                pidKey: 'id',
                loadData: async () => {
                  await loadDblinkList(false);
                  return getDblinkTree.value;
                },

                afterLoadData: () => {
                  const treeRef = getRef('tree');
                  treeRef.setValue(['lrsystemdb']);
                  refreshTable();
                },

                click: (node) => {
                  dbCode = node[0];
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
            mode: 'client',
            columns: getColumns(),
            childColumns: getColumns(columnsConfig, 'child'),
            rowKey: 'name',
            buttons: [],
            tableButtons: getButtons(),
            isExpand: true,
            isPage: true,
            immediate: false,
            loadData: async () => {
              if (dbCode) {
                const res = await dbtableApi.getTables(dbCode);
                return res;
              }
              return [];
            },
            expandChange: async (data: any) => {
              // console.log(data, 'expandChange');
              const { row } = data;
              return await dbtableApi.getColumns(dbCode, row.name);
            },
          },
        },
      ],
    },
  ]);
</script>
