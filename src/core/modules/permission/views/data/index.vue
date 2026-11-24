<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { useDbSource } from '@/core/hooks/data/useDbSource';
  import { api } from '@/core/modules/permission/api/data';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();
  const { getRoleName, getUserName } = useOrganization();
  const { loadDbSourceAll, getDbSourceAll } = useDbSource();

  // 页面权限处理

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增普通数据权限'),
        name: 'permission_data_form',
        width: 800,
        height: 640,
        param: { isEdit: false },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    addDataSource: () => {
      openForm({
        title: t('新增数据视图数据权限'),
        name: 'permission_data_dform',
        width: 800,
        height: 640,
        param: { isEdit: false },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: `${t('编辑')}${row.f_Type == 1 ? '' : t('数据源')}${t('数据权限')}`,
        name: row.f_Type == 1 ? 'permission_data_form' : 'permission_data_dform',
        width: 800,
        height: 640,
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
        content: `${t('您确定删除')}【${row.f_Name}】${t('吗')}`,
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
  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
  const columnsConfig: Record<string, ColConfig> = {
    f_Code: {
      formatter: ({ row }) => {
        loadDbSourceAll();
        if (row.f_Type == 3) {
          return h(
            'div',
            {},
            (getDbSourceAll.value?.find((t) => t.f_Id == row.f_Code) || {}).f_Name || row.f_Code,
          );
        } else {
          return h('div', {}, row.f_Code);
        }
      },
    },
    f_ObjectType: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            bordered: false,
            color: row.f_ObjectType == 1 ? 'success' : 'error',
          },
          () => (row.f_ObjectType == 1 ? t('角色') : t('人员')),
        );
      },
    },
    f_Type: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            bordered: false,
            color: row.f_Type == 1 ? 'success' : 'warning',
          },
          () => (row.f_Type == 1 ? t('开发功能') : t('数据视图')),
        );
      },
    },
    f_ObjectId: {
      formatter: ({ row }) => {
        return h(
          'div',
          {},
          row.f_ObjectType == 1 ? getRoleName(row.f_ObjectId) : getUserName(row.f_ObjectId),
        );
      },
    },
  };
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
        sidx: 'F_CreateDate DESC',
        loadData: async (params) => {
          const res = await api.getPage(params);
          return res;
        },
      },
    },
  ]);
</script>
