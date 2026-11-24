<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { Tag, Switch } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useDblink } from '/@/core/hooks/data/useDblink';
  import { api } from '/@/core/modules/data/api/codeTable';
  import type {
    CodeTableDiffColumnDto,
    CodeTableInvalidDto,
  } from '/@/core/modules/data/api/codeTable';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { getDblinkTree, loadDblinkList } = useDblink();
  const { createConfirm, success, warning } = useMessage();

  let dbCode = 'lrsystemdb';
  let dbName = t('系统数据库');

  // 「更新到表」的确认内容：把模型与库里的列差异摊开给操作者看，回收列必须逐条过目
  const columnLine = (col: CodeTableDiffColumnDto) =>
    h(
      'div',
      { style: 'padding-left:12px;line-height:22px' },
      `${col.name}${col.dataType ? ` · ${col.dataType}` : ''}${col.description ? ` · ${col.description}` : ''}`,
    );
  const columnGroup = (label: string, list: CodeTableDiffColumnDto[], color: string) => {
    if (!list.length) {
      return [];
    }
    return [
      h(
        'div',
        { style: `margin-top:8px;color:${color};font-weight:600` },
        `${label}（${list.length}）`,
      ),
      ...list.map(columnLine),
    ];
  };

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      if (!dbCode) {
        return warning(`${t('请选择数据库')}!`);
      }
      openForm({
        title: t('新增'),
        name: 'data_codeTable_form',
        height: 600,
        width: 1024,
        param: { isEdit: false, dbCode },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    edit: (row) => {
      openForm({
        title: `${t('编辑')}-${row.f_TableName}`,
        name: 'data_codeTable_form',
        height: 600,
        width: 1024,
        param: { isEdit: true, keyValue: row.f_Id, dbCode },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: ({ f_TableName, f_Id }) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${f_TableName}】${t('吗')}`,
        onOk: async () => {
          const res = await api.remove(f_Id);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
    update: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定同步表')}【${row.f_TableName}】${t('到系统中吗')}`,
        onOk: async () => {
          const postData = {
            tableList: [
              {
                name: row.f_TableName,
                description: row.f_Description,
              },
            ],
          };
          const res = await api.importTable(dbCode, postData);
          if (res) {
            success(t('同步成功'));
            refreshTable();
          }
        },
      });
    },
    updateTable: async (row) => {
      const diff = await api.getColumnDiff(row.f_Id, dbCode);
      if (!diff) {
        return;
      }
      if (diff.isFrameworkTable) {
        warning(
          `${t('宿主自有表')}【${diff.tableName}】${t('不能由数据模型改动结构，请点「清理失效登记」移除该登记')}`,
        );
        return;
      }
      const adds = diff.add || [];
      const drops = (diff.drop || []).filter((item) => !item.isProtected);
      const locked = (diff.drop || []).filter((item) => item.isProtected);
      const content = h('div', { style: 'max-height:360px;overflow:auto' }, [
        h(
          'div',
          diff.tableExists
            ? `${t('您确定更新设置数据')}【${diff.tableName}】${t('到数据库中吗')}`
            : `${t('表')}【${diff.tableName}】${t('在库中还不存在，本次将新建')}`,
        ),
        ...columnGroup(t('将新增的列'), adds, 'var(--color-success, #52c41a)'),
        ...columnGroup(t('将回收的列'), drops, 'var(--color-error, #ff4d4f)'),
        ...columnGroup(t('主键/自增列，不参与回收'), locked, 'var(--color-warning, #faad14)'),
        drops.length
          ? h(
              'div',
              { style: 'margin-top:8px;color:var(--color-error, #ff4d4f)' },
              t('回收列会连列上的数据一起删掉且无法恢复；确认前请逐条核对。'),
            )
          : null,
      ]);
      createConfirm({
        title: t('提示'),
        iconType: drops.length ? 'error' : 'warning',
        content,
        onOk: async () => {
          const res = await api.createOrUpdateTable(
            row.f_Id,
            dbCode,
            dbName,
            drops.map((item) => item.name).join(','),
          );
          if (res) {
            success(t('更新成功'));
            refreshTable();
          }
        },
      });
    },
    clean: async () => {
      if (!dbCode) {
        return warning(`${t('请选择数据库')}!`);
      }
      const list = await api.getInvalids(dbCode);
      if (!list) {
        return;
      }
      // 库连接读不出来时（unknown）不替操作者做决定，只列能核对的部分
      const rows = list.filter((item) => item.reason !== 'unknown');
      const skipped = list.length - rows.length;
      if (!rows.length) {
        return warning(
          skipped
            ? `${t('本库有')}${skipped}${t('条登记无法核对，请检查数据库连接')}`
            : t('没有需要清理的登记'),
        );
      }
      const reasonText = (item: CodeTableInvalidDto) =>
        item.reason === 'framework'
          ? t('宿主自有表，不该登记进数据模型')
          : t('库里已经没有这张表');
      const content = h('div', { style: 'max-height:360px;overflow:auto' }, [
        h('div', {}, `${t('将删除以下')}${rows.length}${t('条登记')}`),
        ...rows.map((item) =>
          h(
            'div',
            { style: 'padding-left:12px;line-height:22px' },
            `${item.tableName} · ${reasonText(item)}${
              item.physicalExists ? ` · ${t('物理表仍在，只清登记')}` : ''
            }`,
          ),
        ),
        h(
          'div',
          { style: 'margin-top:8px;color:var(--color-error, #ff4d4f)' },
          t('只删除数据模型里的登记和字段行，不会删除库里的表和数据。'),
        ),
      ]);
      createConfirm({
        title: t('提示'),
        iconType: 'error',
        content,
        onOk: async () => {
          const res = await api.deletes(rows.map((item) => item.id).join(','));
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
    import: () => {
      if (!dbCode) {
        warning(`${t('请选择数据库')}!`);
        return;
      }
      openForm({
        title: t('导入表'),
        btnText: t('确认'),
        name: 'lr-dbtable-panel',
        param: { dbCode: dbCode },
        width: 800,
        height: 600,
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
  const columnsConfig: Record<string, ColConfig> = {
    f_IsPrimaryKey: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.f_IsPrimaryKey == 1,
          size: 'small',
        });
      },
    },
    f_IsNullable: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.f_IsNullable == 1,
          size: 'small',
        });
      },
    },
    f_IsIdentity: {
      formatter: ({ row }) => {
        return h(Switch, {
          checked: row.f_IsIdentity == 1,
          size: 'small',
        });
      },
    },
  };
  const minColumnsConfig: Record<string, ColConfig> = {
    f_State: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            bordered: false,
            color: row.f_State == 1 ? 'success' : 'warning',
          },
          () => (row.f_State == 1 ? t('同步') : t('未同步')),
        );
      },
    },
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
            title: '数据库',
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                valueKey: 'id',
                labelKey: 'label',
                pidKey: 'id',
                loadData: async () => {
                  await loadDblinkList(false);
                  return getDblinkTree.value;
                },

                afterLoadData: () => {
                  const treeRef = getRef('tree');
                  treeRef.setValue(['lrsystemdb']);
                  refreshTable();
                },

                click: (node, data) => {
                  dbName = data.node.label;
                  dbCode = node[0];
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
            columns: getColumns(minColumnsConfig),
            childColumns: getColumns(columnsConfig, 'child'),
            rowKey: 'f_Id',
            isPage: true,
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: false,
            isExpand: true,
            sidx: 'F_TableName DESC',
            loadData: async (param) => {
              if (!dbCode) {
                return { rows: [] };
              }
              param.dbCode = dbCode;
              const res = await api.getTablePage(param);
              return res;
            },
            expandChange: async (data: any) => {
              const { row } = data;
              // @ts-ignore
              return (await api.get(row.f_Id))?.lr_db_codecolumnsList || [];
            },
          },
        },
      ],
    },
  ]);
</script>
