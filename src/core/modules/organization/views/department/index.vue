<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, computed, h } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useCompanyStore } from '/@/core/store/organization/company';

  import { api as departmentApi } from '../../api/department';

  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();
  const companyStore = useCompanyStore();

  let companyId = 'all';

  // 表单弹窗尺寸：按当前字段数量收紧高度，内容高度约 350px，留出上下留白且不出现滚动条
  const formWidthHeight = {
    width: 800,
    height: 440,
  };

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增部门'),
        name: 'organization_department_form',
        ...formWidthHeight,
        param: { companyId },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑部门'),
        name: 'organization_department_form',
        param: { isEdit: true, keyValue: row.f_DepartmentId, companyId },
        ...formWidthHeight,
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
          const res = await departmentApi.remove(row.f_DepartmentId);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
  };

  // 页面权限处理
  const { getButtons, getColumns } = useAuth(pageInfo, { buttonClick });

  const columnsConfig: Record<string, ColConfig> = {
    f_WechatSyn: {
      formatter: ({ row }) => {
        return h(Tag, { bordered: false, color: row.f_WechatSyn == 1 ? 'success' : 'error' }, () =>
          row.f_WechatSyn == 1 ? t('已同步') : t('未同步'),
        );
      },
    },
  };

  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };

  const indexRef = ref();
  const treeData = computed(() => companyStore.list);

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
                list: treeData,
                loadData: async () => {
                  await companyStore.load();
                  return [];
                },
                click: (node) => {
                  if (node.length == 0) {
                    companyId = '';
                  } else {
                    companyId = node[0];
                  }
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
            rowKey: 'f_DepartmentId',
            pidKey: 'f_ParentId',
            isTree: true,
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: true,
            loadData: async () => {
              const res = await departmentApi.getList(companyId || 'all', '', '', true);
              return res;
            },
          },
        },
      ],
    },
  ]);
</script>
