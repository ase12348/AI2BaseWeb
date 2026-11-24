<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useLanguage } from '/@/core/hooks/setting/useLanguage';
  import { api } from '../../api/mapping';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success, createConfirm } = useMessage();
  const { getTypeList } = useLanguage();
  const columns = computed(() => {
    const _columns: any[] = [];
    getTypeList.value.forEach((item) => {
      _columns.push({ label: item.f_Name, prop: item.f_Code, minWidth: '120', isKeyword: true });
    });
    return _columns;
  });

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openForm({
        title: t('新增翻译'),
        name: 'language_mapping_form',
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: t('编辑翻译'),
        name: 'language_mapping_form',
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
        content: `${t('此操作将永久删除该数据')}, ${t('是否继续')}?`,
        onOk: async () => {
          const res = await api.remove(row.f_code);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
  };

  const { getButtons } = useAuth(pageInfo, { buttonClick });

  const indexRef = ref();
  const { openForm, getRef } = useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: columns.value,
        rowKey: 'f_code',
        buttons: getButtons('panel'),
        tableButtons: getButtons(),
        isPage: true,
        immediate: true,
        loadData: async (params) => {
          params.sidx = 'F_Name';
          const res = await api.getPage(params);
          return res;
        },
      },
    },
  ]);

  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
</script>
