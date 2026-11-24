<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api as strategyApi } from '/@/core/modules/message/api/strategy';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增消息策略'),
        name: 'message_strategy_form',
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑消息策略'),
        name: 'message_strategy_form',
        param: { isEdit: true, row },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: ({ f_Id, f_StrategyName }) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${f_StrategyName}】${t('吗')}`,
        onOk: async () => {
          const res = await strategyApi.remove(f_Id);
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
  const formatterType = (cellvalue) => {
    cellvalue = (cellvalue || '') + '';
    const vlist = cellvalue.split(',');
    const rlist = [];
    vlist.forEach((item) => {
      switch (item) {
        case '1':
          rlist.push(t('邮件'));
          break;
        case '3':
          rlist.push(t('短信'));
          break;
        case '4':
          rlist.push(`${t('系统')}IM`);
          break;
      }
    });
    return String(rlist);
  };

  const columnsConfig: Record<string, ColConfig> = {
    f_MessageType: {
      formatter: ({ row }) => {
        return h('span', {}, formatterType(row.f_MessageType));
      },
    },
  };
  const indexRef = ref();

  const { getRef, openForm } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: getColumns(columnsConfig),
        rowKey: 'f_Id',
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        isPage: true,
        placeholder: `${t('请输入名称')}/${t('编码')}`,
        loadData: async (params) => {
          const res = await strategyApi.getPage(params);
          return res;
        },
      },
    },
  ]);
</script>
