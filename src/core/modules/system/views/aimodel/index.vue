<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api } from '../../api/aimodel';
  import pageInfo from './page';
  import { getProvider } from './options';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();
  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('添加模型'),
        name: 'system_aimodel_form',
        height: 480,
        width: 600,
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: `${t('编辑模型')}【${row.f_Model}】`,
        name: 'system_aimodel_form',
        param: { isEdit: true, entity: row },
        height: 480,
        width: 600,
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: (row) => {
      const provider = getProvider(row.f_Provider);
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${provider?.label || row.f_Provider}/${row.f_Model}】${t('吗')}`,
        onOk: async () => {
          const res = await api.remove(row.f_Id);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
  };

  const { getButtons, getColumns } = useAuth(pageInfo, { buttonClick });

  const indexRef = ref();
  const { openForm, getRef } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        sidx: 'f_ModifyDate DESC',
        columns: getColumns(),
        rowKey: 'f_Id',
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        loadData: async (params) => {
          const res = await api.getList(params);
          return res;
        },
      },
    },
  ]);
  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
</script>
