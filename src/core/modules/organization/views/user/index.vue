<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h, computed } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api as companyApi } from '../../api/company';
  import { api as userApi } from '../../api/user';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  const companyId = ref('');

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增用户'),
        name: 'organization_user_form',
        width: 800,
        height: 640,
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑用户'),
        name: 'organization_user_form',
        width: 800,
        height: 640,
        param: { isEdit: true, keyValue: row.f_UserId },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${row.f_RealName}】${t('吗')}`,
        onOk: async () => {
          const res = await userApi.remove(row.f_UserId);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
    ResetPassword: (row) => {
      // console.log('ResetPassword');
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('是否重置用户')}【${row.f_RealName}】${t('密码')}`,
        onOk: async () => {
          const res = await userApi.resetPassword(row.f_UserId);
          if (res) {
            success(t('重置成功'));
            refreshTable();
          }
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
    f_Type: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            bordered: false,
            color:
              row.f_Type == 1 || row.f_Type == undefined
                ? 'success'
                : row.f_Type == 2
                  ? 'processing'
                  : 'error',
          },
          () =>
            row.f_Type == 1 || row.f_Type == undefined
              ? t('正式')
              : row.f_Type == 2
                ? t('试用')
                : t('离职'),
        );
      },
    },
    f_Gender: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            bordered: false,
            color: row.f_Gender == 1 ? 'processing' : 'error',
          },
          () => (row.f_Gender == 1 ? t('男') : t('女')),
        );
      },
    },
  };
  const searchInputList = computed(() => {
    let list = [
      {
        id: 'departmentDeepNum',
        type: 'lr-input-department',
        config: {
          isQuickSearch: true,
          label: '',
          companyRequired: true,
          companyId: companyId.value,
          width: 200,
          valueKey: 'f_DeepNum',
          immediate: true,
        },
      },
    ];
    return list;
  });
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

                click: async (node) => {
                  companyId.value = node[0];
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
            columns: getColumns(columnsConfig),
            rowKey: 'f_UserId',
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            /*setButton: ({ buttons, row }) => {
              if (row.f_SecurityLevel) {
                // 特殊账号，不允许编辑删除
                const editbtn = buttons.find((t) => t.prop === 'edit');
                if (editbtn) {
                  editbtn.disabled = true;
                }
                const deletebtn = buttons.find((t) => t.prop === 'delete');
                if (deletebtn) {
                  deletebtn.disabled = true;
                }
              }
            },*/
            // showNumLabel: 'test',
            immediate: true,
            isPage: true,
            sidx: 'F_SortCode ASC,F_CreateDate DESC',
            searchInputList,
            placeholder: `${t('请输入姓名')}/${t('账号')}/${t('电话')}`,
            loadData: async (param) => {
              param.companyId = companyId.value;
              param.isSyn = true;
              const res = await userApi.getPages(param);
              return res;
            },
          },
        },
      ],
    },
  ]);
</script>
