<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import pageInfo from './page';
  import { api } from '/@/core/modules/language/api/mapping';
  import { useDataItem } from '@/core/hooks/data/useDataItem';
  import { useLanguage } from '/@/core/hooks/setting/useLanguage';
  import { t } from '@/core/locales/setupI18n';

  const { getTypeList, getCurrentType } = useLanguage();

  const { loadClassifyList, getClassifys, loadDataItemList, getDataItem } = useDataItem();

  loadClassifyList();

  const columns = computed(() => {
    const _columns: any[] = [];
    getTypeList.value.forEach((item) => {
      _columns.push({ label: item.f_Name, prop: item.f_Code, minWidth: '120', isKeyword: true });
    });
    return _columns;
  });

  let itemCode = ref('');
  // 按钮点击事件
  const buttonClick = {
    edit: (row) => {
      openForm({
        title: t('编辑'),
        name: 'language_dataItem_form',
        param: { isEdit: true, row },
        afterOk: () => {
          refreshTable();
        },
      });
    },
  };

  const { getButtons } = useAuth(pageInfo, { buttonClick });

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
            title: '字典分类',
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',
              config: {
                valueKey: 'f_ItemCode',
                labelKey: 'f_ItemName',
                pidKey: 'f_ParentId',
                idKey: 'f_ItemId',
                list: getClassifys,
                click: (node) => {
                  if (node.length > 0) {
                    itemCode.value = node[0];
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
            columns: columns,
            defaultExpandAll: true,
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: false,
            loadData: async () => {
              await loadDataItemList(itemCode.value, false);

              const res: any[] = [];
              const mappingDic = {};
              const mappingData = await api.getDataItemList(itemCode.value);
              mappingData.forEach((row) => {
                mappingDic[row[getCurrentType.value]] = row;
              });
              (getDataItem.value[itemCode.value] || []).forEach((item) => {
                if (mappingDic[item.f_ItemName]) {
                  res.push(mappingDic[item.f_ItemName]);
                } else {
                  const _row = {};
                  _row[getCurrentType.value] = item.f_ItemName;
                  res.push(_row);
                }
              });
              return res;
            },
          },
        },
      ],
    },
  ]);
</script>
