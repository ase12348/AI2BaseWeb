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
  import { api } from '/@/core/modules/data/api/dbsource';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: `${t('新增')}SQL${t('视图')}`,
        name: 'data_dbsource_form',
        type: 'full',
        param: { isEdit: false },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    addCode: () => {
      openForm({
        title: t('新增脚本视图'),
        type: 'full',
        name: 'data_dbsource_codeform',
        param: { isEdit: false },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    addTable: () => {
      openForm({
        title: t('新增表视图'),
        type: 'full',
        name: 'data_dbsource_tableform',
        param: { isEdit: false },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title:
          row.f_Type === 2
            ? t('编辑脚本视图')
            : row.f_Type === 1
              ? t('编辑表视图')
              : `${t('编辑')}SQL${t('视图')}`,
        name:
          row.f_Type === 2
            ? 'data_dbsource_codeform'
            : row.f_Type === 1
              ? 'data_dbsource_tableform'
              : 'data_dbsource_form',
        type: 'full',
        param: { isEdit: true, keyValue: row.f_Id, code: row.f_Code },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    look: (row) => {
      openForm({
        title: `${t('查看表')}【${row.f_Name}】${t('数据')}`,
        name: 'data_dbsource_lookform',
        param: { code: row.f_Code },
        height: 600,
        width: 1000,
        hasBtns: false,
      });
    },
    delete: ({ f_Name, f_Id }) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${f_Name}】${t('吗')}`,
        onOk: async () => {
          const res = await api.remove(f_Id);
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
    f_Type: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            bordered: false,
            color: row.f_Type == 1 ? 'warning' : row.f_Type == 2 ? 'processing' : 'success',
          },
          () => (row.f_Type == 1 ? t('表') : row.f_Type == 2 ? 'JS' : 'SQL'),
        );
      },
    },
    // 分类目录已去掉：F_Category 现在存逗号分隔的标签串（lr-input-tag 的原生格式），
    // 历史单值分类也按一个标签展示，不再需要 datasourceType 字典映射
    f_Category: {
      formatter: ({ row }) => {
        const tags = String(row.f_Category || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
        if (!tags.length) {
          return h('span', {}, '—');
        }
        return h(
          'span',
          tags.map((tag) => h(Tag, { bordered: false, color: 'blue', key: tag }, () => tag)),
        );
      },
    },
  };
  // 分类目录（lr-layout + 左树 + 分类管理按钮）整块去掉，列表改为顶层单表格
  const { getRef, openForm } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: getColumns(columnsConfig),
        rowKey: 'f_Id',
        isPage: true,
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        immediate: true,
        sidx: 'F_ModifyDate DESC',
        loadData: async (param) => {
          const res = await api.getPage(param);
          return res;
        },
      },
    },
  ]);
</script>
