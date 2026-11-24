<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api } from '../../api/coderule';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增单据编码'),
        name: 'data_coderule_form',
        height: 560,
        width: 800,
        param: { isEdit: false },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: `${t('编辑单据编码')}【${row.f_EnCode}/${row.f_FullName}】`,
        name: 'data_coderule_form',
        param: { isEdit: true, entity: row },
        height: 560,
        width: 800,
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${row.f_EnCode}/${row.f_FullName}】${t('吗')}`,
        onOk: async () => {
          const res = await api.remove(row.f_RuleId);
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
        columns: getColumns({}),
        rowKey: 'f_RuleId',
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        isPage: true,
        loadData: async (param) => {
          const res = await api.getPage(param);
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
