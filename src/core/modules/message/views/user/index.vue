<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref, h } from 'vue';
  import { Icon } from '@/core/components/ui';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api as userApi } from '/@/core/modules/message/api/user';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  // 按钮点击事件-
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增消息用户'),
        name: 'message_user_form',
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑消息用户'),
        name: 'message_user_form',
        param: { isEdit: true, row },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: ({ f_Id, f_Name }) => {
      console.log('delete');
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${f_Name}】${t('吗')}`,
        onOk: async () => {
          const res = await userApi.remove(f_Id);
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
  const columnsConfig: Record<string, ColConfig> = {
    f_Icon: {
      formatter: ({ cellValue }) => {
        return h(Icon, {
          class: 'content-icon',
          icon: cellValue,
        });
      },
    },
  };

  const indexRef = ref();

  const { getRef, openForm } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        mode: 'client',
        columns: getColumns(columnsConfig),
        rowKey: 'f_Id',
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        loadData: async () => {
          const res = await userApi.getList();
          return res;
        },
      },
    },
  ]);
</script>
