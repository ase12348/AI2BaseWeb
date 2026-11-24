<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref, h } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api as companyApi } from '@/core/modules/organization/api/company';
  import { api as postApi } from '@/core/modules/organization/api/post';
  import UserRelation from './userRelation.vue';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  let companyId = '';
  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增岗位'),
        name: 'organization_post_form',
        width: 540,
        height: 360,
        param: { companyId },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑岗位'),
        name: 'organization_post_form',
        param: { isEdit: true, keyValue: row.f_PostId, companyId },
        width: 540,
        height: 360,
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
          const res = await postApi.remove(row.f_PostId);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
    memberAdd: (row) => {
      openForm({
        title: t('添加成员'),
        name: h(UserRelation),
        width: 1000,
        height: 600,
        param: { postId: row.f_PostId },
        afterOk: () => {
          refreshTable();
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
  const { getRef, openForm } = useIndex(indexRef, [
    {
      type: 'lr-layout',
      children: [
        {
          type: 'lr-panel',
          slot: 'left',
          config: {
            title: '公司信息',
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                valueKey: 'f_CompanyId',
                labelKey: 'f_FullName',
                pidKey: 'f_ParentId',
                showIcon: true,
                defaultIcon: 'company',
                iconKey: 'f_Icon',

                loadData: async () => {
                  const res = await companyApi.getList();
                  return res;
                },
                afterLoadData: async (data) => {
                  if (data.length > 0) {
                    companyId = data[0].value;
                    const treeRef = getRef('tree');
                    treeRef.setValue([companyId]);
                    refreshTable();
                  }
                },

                click: async (node) => {
                  if (node[0]) {
                    companyId = node[0];
                    refreshTable();
                  } else {
                    const treeRef = getRef('tree');
                    treeRef.setValue([companyId]);
                  }
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
            columns: getColumns(),
            rowKey: 'f_PostId',
            isTree: true,
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: false,
            loadData: async () => {
              const res = await postApi.getList({ companyId: companyId });
              return res;
            },
          },
        },
      ],
    },
  ]);
</script>
