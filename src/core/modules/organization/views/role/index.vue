<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h, markRaw } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import userRelation from './userRelation.vue';
  import { api as roleApi } from '../../api/role';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const userRelationVue = markRaw(userRelation);
  const { createConfirm, success } = useMessage();
  let roleId = '';

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增角色'),
        name: 'organization_role_form',
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑角色'),
        name: 'organization_role_form',
        param: { isEdit: true, keyValue: row.f_RoleId },
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
          const res = await roleApi.remove(row.f_RoleId);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
    memberAdd: (row) => {
      openForm({
        title: `${t('成员添加')}-` + row.f_FullName,
        type: 'full',
        name: userRelationVue,
        param: { isEdit: true, keyValue: row.f_RoleId },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    dataItem: () => {
      openForm({
        title: t('分类管理'),
        name: 'data_dataitem_index',
        height: 600,
        width: 1000,
        hasBtns: false,
        config: { code: 'rolecategory' },
        afterClose: async () => {
          const tableRef = getRef('tree');
          await tableRef.refreshData();
        },
      });
    },
  };

  // 页面权限处理
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
            const res = await roleApi.update(row.f_RoleId, row);
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
      type: 'lr-layout',
      children: [
        {
          type: 'lr-panel',
          slot: 'left',
          config: {
            title: '角色分类',
            toolBtns: getButtons('tool'),
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                dataType: 'dataItem',
                dataCode: 'rolecategory',

                click: async (node) => {
                  roleId = node[0];
                  refreshTable();
                },
              },
            },
          ],
        },
        {
          id: 'mainTable',
          type: 'lr-table-panel',
          config: {
            mode: 'client',
            columns: getColumns(columnsConfig),
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: true,
            loadData: async () => {
              let res = await roleApi.getList();
              if (roleId) {
                // @ts-ignore
                res = res.filter((t) => t.f_Category == roleId);
              }
              return res;
            },
          },
        },
      ],
    },
  ]);
</script>
