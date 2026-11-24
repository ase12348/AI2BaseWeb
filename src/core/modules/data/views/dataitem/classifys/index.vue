<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useDataItem } from '@/core/hooks/data/useDataItem';
  import { dataitemEntity, api } from '/@/core/modules/data/api/dataitem';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { loadClassifyList, getClassifysOptions } = useDataItem();

  const { createConfirm, success } = useMessage();

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增'),
        name: 'data_dataitem_classifys_form',
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑'),
        name: 'data_dataitem_classifys_form',
        param: { isEdit: true, row },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${row.f_ItemName}】${t('吗')}`,
        onOk: async () => {
          const res = await api.removeCategory(row.f_ItemId);
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

  const updateRow = async (row) => {
    const entity: Record<string, any> = {};
    Object.keys(row).forEach((key) => {
      if (!['children', 'hasChildren'].includes(key)) {
        entity[key] = row[key];
      }
    });
    const res = await api.updateCategory(row.f_ItemId, entity as dataitemEntity);
    return res;
  };

  const columnsConfig: Record<string, ColConfig> = {
    f_EnabledMark: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.f_EnabledMark === 1,
          size: 'small',
          onClick: async (value) => {
            row.f_EnabledMark = value ? 1 : 0;
            const res = await updateRow(row);
            if (res) {
              success(t('更新成功'));
            }
          },
        });
      },
    },
    f_IsTree: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.f_IsTree === 1,
          size: 'small',
          onClick: async (value) => {
            row.f_IsTree = value ? 1 : 0;
            const res = await updateRow(row);
            if (res) {
              success(t('更新成功'));
            }
          },
        });
      },
    },
  };

  const { getRef, openForm } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        mode: 'client',
        columns: getColumns(columnsConfig),
        rowKey: 'f_ItemId',
        pidKey: 'f_ParentId',
        isTree: true,
        defaultExpandAll: false,
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        loadData: async () => {
          await loadClassifyList(false);
          return getClassifysOptions() as any[];
        },
      },
    },
  ]);
</script>
