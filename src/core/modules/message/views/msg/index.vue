<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h, onMounted } from 'vue';
  import { Tag, Button } from 'ant-design-vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { api } from '../../api/msg';
  import { api as msgApi } from '../../api/msgsys';
  import { api as apiUser } from '../../api/user';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success, warning } = useMessage();

  const sysUserList = ref([]);
  onMounted(async () => {
    sysUserList.value = await apiUser.getList();
  });
  const getName = (code) => {
    const sysUser = sysUserList.value.find((t) => t.f_Code == code);
    if (sysUser) {
      return sysUser.f_Name;
    }
    return '';
  };
  let isDelete = 0;
  // 按钮点击事件
  const buttonClick = {
    delete: async () => {
      const data = await getSelections();
      if (!data.length) {
        warning(`${t('请选择数据')}！`);
        return;
      }
      const ids = String(data.map((t) => t.f_MsgId));
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('此操作将')}${isDelete == 1 ? t('彻底') : ''}${t('删除数据')}, ${t('是否继续')}`,
        onOk: async () => {
          let res;
          if (isDelete == 0) {
            res = api.virtualDelete({ ids: ids });
          } else {
            res = api.thoroughDelete({ ids: ids });
          }
          if (res) {
            clearSelection();
            success(t('删除成功'));
            setTimeout(() => {
              refreshTable();
            }, 100);
          }
        },
      });
    },
  };

  const { getButtons, getColumns } = useAuth(pageInfo, { buttonClick });

  const columnsConfig: Record<string, ColConfig> = {
    f_IsRead: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            color: row.f_IsRead == 1 ? 'success' : '#ff8000',
          },
          () => (row.f_IsRead == 1 ? t('已读') : t('未读')),
        );
      },
    },
    f_SendUserId: {
      formatter: ({ row }) => {
        return h('span', {}, getName(row.f_SendUserId));
      },
    },
    f_Content: {
      formatter: ({ cellValue, row }) => {
        return h(
          Button,
          {
            type: 'link',
            onClick: () => {
              const sysuser = sysUserList.value.find((t) => t.f_Code == row.f_SendUserId);
              if (sysuser && sysuser.f_Url) {
                if (sysuser.f_Url === 'workflow_task_form') {
                  let type;
                  if (row.f_Content.indexOf(`【${t('审批')}】`) != -1) {
                    type = 'audit';
                  } else if (row.f_Content.indexOf(`【${t('查阅')}】`) != -1) {
                    type = 'look';
                  } else if (row.f_Content.indexOf(`【${t('重新提交')}】`) != -1) {
                    type = 'create';
                  } else {
                    type = 'lookmy';
                  }
                  openForm({
                    title: t('查看消息'),
                    name: sysuser.f_Url,
                    type: 'full',
                    param: { token: row.f_ContentId, look: type === 'lookmy' ? 'startNode' : '' },
                    hasSaveBtn: false,
                  });
                } else {
                  openForm({
                    title: t('查看'),
                    name: sysuser.f_Url,
                    type: 'full',
                    param: { token: row.f_ContentId, row },
                    hasBtns: false,
                    afterOk: () => {
                      refreshTable();
                    },
                  });
                }
              }
              row.f_IsRead = 1;
              api.read(row.f_MsgId);
            },
          },
          () => cellValue,
        );
      },
    },
  };
  const getSelections = async () => {
    const tableRef = getRef('mainTable');
    return await tableRef.getSelections();
  };
  const clearSelection = async () => {
    const tableRef = getRef('mainTable');
    return await tableRef.clearSelection();
  };
  const indexRef = ref();
  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
  const { getRef, openForm } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: getColumns(columnsConfig),
        rowKey: 'f_MsgId',
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        isPage: true,
        isSaveSelectData: true,
        isMultiSelect: true,
        searchInputList: [
          {
            id: 'isDelete',
            type: 'radio',
            config: {
              isQuickSearch: true,
              label: '',
              defaultValue: 0,
              optionType: 'button',
              options: [
                { label: t('站内消息'), value: 0 },
                { label: t('回收消息'), value: 1 },
              ],
              onchange: () => {
                refreshTable();
                clearSelection();
              },
            },
          },
        ],
        loadData: async (params) => {
          params.sidx = 'F_IsRead';
          isDelete = params.isDelete;
          const res = await msgApi.getPage(params);
          return res;
        },
      },
    },
  ]);
</script>
