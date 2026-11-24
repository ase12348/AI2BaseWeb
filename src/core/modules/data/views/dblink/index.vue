<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import pageInfo from './page';
  import { api as dblinkApi } from '/@/core/modules/data/api/dblink';
  import { useMessage } from '@/core/hooks/useMessage';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增'),
        name: 'data_dblink_form',
        height: 560,
        width: 640,
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑'),
        name: 'data_dblink_form',
        height: 560,
        width: 640,
        param: { isEdit: true, row },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: ({ f_DBAlias, f_Id }) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${f_DBAlias}】${t('吗')}`,
        onOk: async () => {
          const res = await dblinkApi.remove(f_Id);
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
  const { getRef, openForm } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        mode: 'client',
        columns: getColumns(),
        rowKey: 'f_Id',
        pidKey: '',
        isTree: true,
        defaultExpandAll: true,
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        loadData: async () => {
          const res = await dblinkApi.getList();
          return res;
        },
      },
    },
  ]);
</script>
