<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { Icon } from '@/core/components/ui';
  import { addIcon } from '@/core/utils/jcode';
  import { api } from '../../api/icon';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  let category = '';
  const resetData = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.resetData();
  };
  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增'),
        name: 'data_icon_form',
        height: 424,
        param: { category },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑'),
        name: 'data_icon_form',
        height: 424,
        param: { isEdit: true, keyValue: row.f_Id },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${row.f_Name}-${row.f_Code}】${t('吗')}`,
        onOk: async () => {
          const res = await api.remove(row.f_Id);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
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
        config: { code: 'systemIcon' },
        afterClose: async () => {
          const tableRef = getRef('tree');
          await tableRef.refreshData();
        },
      });
    },
  };

  const { getButtons, getColumns } = useAuth(pageInfo, { buttonClick });

  const columnsConfig: Record<string, ColConfig> = {
    f_Name: {
      formatter: ({ row }) => {
        return h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
            },
          },
          [
            h(Icon, {
              icon: row.f_Code,
              style: {
                marginRight: '4px',
              },
            }),
            h('span', {}, row.f_Name),
          ],
        );
      },
    },
  };

  const indexRef = ref();
  const { openForm, getRef } = useIndex(indexRef, [
    {
      type: 'lr-layout',
      children: [
        {
          type: 'lr-panel',
          slot: 'left',
          config: {
            title: '分类',
            toolBtns: getButtons('tool'),
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                dataType: 'dataItem',
                dataCode: 'systemIcon',

                click: async (node) => {
                  if (node.length > 0) {
                    category = node[0];
                  } else {
                    category = '';
                  }
                  resetData();
                },
              },
            },
          ],
        },
        {
          id: 'mainTable',
          type: 'lr-table-panel',
          config: {
            sidx: 'f_ModifyDate DESC',
            columns: getColumns(columnsConfig),
            rowKey: 'f_Id',
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: true,
            isPage: true,
            loadData: async (params) => {
              params.f_Category = category;
              const res = await api.getPage(params);
              res.rows.forEach((row) => {
                addIcon(`jcode:${row.f_Code}`, {
                  body: row.f_Body,
                  width: row.f_Width || 1024,
                  height: row.f_Height || 1024,
                });
              });
              return res;
            },
          },
        },
      ],
    },
  ]);
  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
</script>
