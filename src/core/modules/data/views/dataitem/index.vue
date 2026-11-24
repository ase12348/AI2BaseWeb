<template>
  <div class="l-dataitem-page">
    <lr-c-schema-index ref="indexRef" style="flex: 1; min-height: 0; height: auto" />
  </div>
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h, computed, onMounted } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useDataItem } from '@/core/hooks/data/useDataItem';
  import { dataItemDetailEntity, api } from '/@/core/modules/data/api/dataitem';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const props = defineProps({
    code: String,
  });

  const { createConfirm, success, error } = useMessage();
  const { loadClassifyList, getClassifys, loadDataItemList } = useDataItem();

  loadClassifyList();
  onMounted(async () => {
    if (props.code) {
      let data = await api.getClassify(props.code);
      isTree = data.f_IsTree == 1;
      classifyId = data.f_ItemId;
    }
  });
  let itemCode = ref('');
  let classifyId = '';
  let isTree = false;

  const dataItemCode = computed(() => {
    return props.code || itemCode.value;
  });

  // 保存后刷新字典缓存
  const reloadDataItemCache = (code: string) => {
    loadDataItemList(code, false);
  };

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      if (!dataItemCode.value) {
        error(`${t('请选择数据分类')}!`);
        return;
      }
      openForm({
        title: t('新增'),
        name: 'data_dataitem_form',
        param: { code: dataItemCode.value, isTree, classifyId },
        afterOk: () => {
          refreshTable();
          reloadDataItemCache(dataItemCode.value);
        },
      });
    },
    edit: (row) => {
      openForm({
        title: `${t('编辑')}【${row.f_ItemName}】`,
        name: 'data_dataitem_form',
        param: { isEdit: true, code: dataItemCode.value, classifyId, isTree, row },
        afterOk: () => {
          refreshTable();
          reloadDataItemCache(dataItemCode.value);
        },
      });
    },
    delete: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${row.f_ItemName}】${t('吗')}`,
        onOk: async () => {
          const res = await api.removeDetail(row.f_Id);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
    classifys: () => {
      openForm({
        title: t('分类管理'),
        name: 'data_dataitem_classifys_index',
        height: 600,
        width: 1000,
        hasBtns: false,
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
    f_EnabledMark: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.f_EnabledMark === 1,
          size: 'small',
          onClick: async (value) => {
            row.f_EnabledMark = value ? 1 : 0;
            const entity: Record<string, any> = {};
            Object.keys(row).forEach((key) => {
              if (!['children', 'hasChildren'].includes(key)) {
                entity[key] = row[key];
              }
            });
            const res = await api.updateDetail(row.f_Id, entity as dataItemDetailEntity);
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
            title: '字典分类',
            toolBtns: getButtons('tool'),
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
                click: (node, e) => {
                  console.log(e);
                  isTree = e.node.f_IsTree === 1;
                  classifyId = e.node.f_ItemId;
                  if (node.length > 0) {
                    itemCode.value = node[0];
                  } else {
                    itemCode.value = '';
                  }
                  refreshTable();
                },
              },
            },
          ],
          display: !props.code,
        },
        {
          id: 'mainTable',
          type: 'lr-table-panel',
          config: {
            mode: 'client',
            columns: getColumns(columnsConfig),
            rowKey: 'f_Id',
            pidKey: 'f_ParentId',
            isTree: true,
            defaultExpandAll: true,
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: !!props.code,
            loadData: async () => {
              if (!dataItemCode.value) {
                return [];
              }
              const res = await api.getDetails(dataItemCode.value);
              return res;
            },
          },
        },
      ],
    },
  ]);
</script>
<style lang="less" scoped>
  .l-dataitem-page {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
