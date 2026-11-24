<template>
  <div class="lr-block">
    <lr-c-schema-index ref="indexRef" />
  </div>
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import pageInfo from './page';
  import { api } from '@/core/modules/organization/api/user';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  // 按钮点击事件
  const buttonClick = {
    delete: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定从黑名单中删除')}【${row.f_RealName}】${t('吗')}`,
        onOk: async () => {
          const entity = await api.get(row.f_UserId);
          entity.user.F_IsBlack = 0;
          const res = await api.update(row.f_UserId, entity);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
  };

  const buttonConfig = {
    add: {
      layerTitle: t('用户选择'),
      layerName: 'lr-user-panel',
      afterOk: async (list) => {
        if (list.length > 0) {
          for (const entity of list) {
            entity.F_IsBlack = 1;
            await api.update(entity.f_UserId, { user: entity });
            refreshTable();
          }
        }
      },
    },
  };

  // 页面权限处理
  const { getButtons, getColumns } = useAuth(pageInfo, { buttonClick, buttonConfig });

  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };

  const indexRef = ref();
  const columnsConfig: Record<string, ColConfig> = {
    f_Gender: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            bordered: false,
            color: row.f_Gender == 1 ? 'success' : 'error',
          },
          () => (row.f_Gender == 1 ? t('男') : t('女')),
        );
      },
    },
  };
  const { getRef } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: getColumns(columnsConfig),
        rowKey: 'f_UserId',
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        isPage: true,
        sidx: 'F_SortCode ASC,F_CreateDate DESC',
        loadData: async (param) => {
          param.isBlack = 1;
          const res = await api.getPages(param);
          return res;
        },
      },
    },
  ]);
</script>
