<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useArea } from '/@/core/hooks/data/useArea';
  import { api, type areaEntity } from '/@/core/modules/data/api/area';
  import { Switch } from 'ant-design-vue';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  const { loadAreaList } = useArea();

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增'),
        name: 'data_area_form',
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑'),
        name: 'data_area_form',
        param: { isEdit: true, row: row },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${row.f_AreaName}${row.f_AreaCode}】${t('吗')}`,
        onOk: async () => {
          const res = await api.remove(row.f_AreaId);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
  };

  const { getButtons, getColumns } = useAuth(pageInfo, { buttonClick });

  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
  const indexRef = ref();

  const columnsConfig: Record<string, ColConfig> = {
    f_EnabledMark: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.f_EnabledMark === 1,
          size: 'small',
          onClick: async (value) => {
            row.f_EnabledMark = value ? 1 : 0;
            const entity: Record<string, any> = {};
            Object.keys(row).forEach((key) => {
              if (!['children', 'hasChildren'].includes(key)) {
                entity[key] = row[key];
              }
            });
            const res = await api.update(row.f_AreaId, entity as areaEntity);
            if (res) {
              success(t('更新成功'));
            }
          },
        });
      },
    },
  };

  const { openForm, getRef } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: getColumns(columnsConfig),
        rowKey: 'f_AreaId',
        isTree: true,
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        lazy: true,
        loadData: async () => {
          const res = await loadAreaList('0', false);
          return res;
        },
        loadChildren: async ({ row }) => {
          return await loadAreaList(row.f_AreaId, false);
        },
      },
    },
  ]);
</script>
