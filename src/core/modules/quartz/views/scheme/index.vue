<template>
  <div class="lr-block">
    <lr-c-schema-index ref="indexRef" />
  </div>
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { Switch, Tag } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api as quartzSchemeApi } from '/@/core/modules/quartz/api/scheme';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();
  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增任务计划'),
        name: 'quartz_scheme_form',
        width: 700,
        height: 650,
        param: {},
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: async (row) => {
      openForm({
        title: t('编辑任务计划'),
        name: 'quartz_scheme_form',
        width: 700,
        height: 650,
        param: { isEdit: true, keyValue: row.f_Id },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: ({ f_Name, f_Id }) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${f_Name}】${t('吗')}`,
        onOk: async () => {
          const res = await quartzSchemeApi.remove(f_Id);
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

  const indexRef = ref();

  const columnsConfig: Record<string, ColConfig> = {
    f_IsActive: {
      formatter: ({ row }) => {
        if (row.f_IsActive === 3) {
          return h(
            Tag,
            {
              bordered: false,
              color: 'warning',
            },
            () => t('结束'),
          );
        }

        return h(Switch, {
          checked: row.f_IsActive === 1,
          size: 'small',
          onClick: async (value) => {
            row.f_IsActive = value ? 1 : 2;
            //1 启动任务 2关闭任务
            let type = row.f_IsActive === 1 ? 'resumeJob' : 'pauseJob';
            const res = await quartzSchemeApi[type](row.f_Id);
            if (res) {
              success(t('更新成功'));
            }
          },
        });
      },
    },
    f_RunActive: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            style: {
              display: row.f_IsActive != 1 ? 'none' : 'inline-block',
            },
            bordered: false,
            color: row.f_RunActive === 1 ? 'success' : 'error',
          },
          () =>
            row.f_RunActive === 1 ? t('正常') : row.f_RunActive === 2 ? t('异常') : t('未开始'),
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
        loadData: async (params) => {
          const res = await quartzSchemeApi.getPage(params);
          return res;
        },
      },
    },
  ]);
</script>
