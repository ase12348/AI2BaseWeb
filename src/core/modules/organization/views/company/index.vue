<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useCompanyStore } from '/@/core/store/organization/company';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();
  const companyStore = useCompanyStore();

  const formWidthHeight = {
    width: 720,
    height: 600,
  };

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增公司'),
        name: 'organization_company_form',
        ...formWidthHeight,
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: `${t('编辑公司')}${row.f_FullName}`,
        name: 'organization_company_form',
        ...formWidthHeight,
        param: { isEdit: true, keyValue: row.f_CompanyId },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${row.f_FullName}】${t('吗')}`,
        onOk: async () => {
          const res = await companyStore.remove(row.f_CompanyId);
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
  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
  const { openForm, getRef } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        mode: 'client',
        columns: getColumns(),
        rowKey: 'f_CompanyId',
        pidKey: 'f_ParentId',
        isTree: true,
        defaultExpandAll: true,
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        loadData: async () => {
          const res = await companyStore.load();
          return res;
        },
      },
    },
  ]);
</script>
