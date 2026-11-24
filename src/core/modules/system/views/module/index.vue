<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h, computed, nextTick, onMounted } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { api as moduleApi } from '/@/core/modules/system/api/module';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  const { getAllModuleList, getAllModuleExpands, getAllModuleGroup, loadList } = useMenu();

  /** 只有一个控制台：可维护全部菜单 */
  const scopeMenuIds = computed(
    () => new Set(getAllModuleList.value.map((item) => item.f_ModuleId)),
  );

  const nameFilter = ref('');

  /** 名称命中的菜单主键；空关键字返回 null 表示不过滤 */
  const getKeywordIds = (keyword: string) => {
    const value = keyword.trim().toLowerCase();
    if (!value) {
      return null;
    }
    return new Set(
      getAllModuleList.value
        .filter((item) => (item.f_FullName || '').toLowerCase().includes(value))
        .map((item) => item.f_ModuleId),
    );
  };

  /** 目录可见集合：范围内（且命中名称）的菜单，连同它们的祖先目录 */
  const getVisibleTreeIds = (keyword: string) => {
    const matched = getKeywordIds(keyword);
    const moduleById = new Map(getAllModuleList.value.map((item) => [item.f_ModuleId, item]));
    const visible = new Set<string>();
    getAllModuleList.value.forEach((item) => {
      if (!scopeMenuIds.value.has(item.f_ModuleId)) {
        return;
      }
      if (matched && !matched.has(item.f_ModuleId)) {
        return;
      }
      const visited = new Set<string>();
      let current = moduleById.get(item.f_ModuleId);
      while (current && !visited.has(current.f_ModuleId)) {
        visited.add(current.f_ModuleId);
        visible.add(current.f_ModuleId);
        const parentId = current.f_ParentId;
        if (!parentId || parentId === '0') {
          break;
        }
        current = moduleById.get(parentId);
      }
    });
    return visible;
  };

  const treeList = computed(() => {
    const visible = getVisibleTreeIds(nameFilter.value);
    return getAllModuleExpands.value.filter((item) => visible.has(item.f_ModuleId));
  });

  let moduleId = '0';

  // 打开表单：把当前范围（应用编码 + 范围内可见的目录）一起传进去
  const openModuleForm = (options: Record<string, any>) => {
    const { title, ...param } = options;
    openForm({
      title,
      name: 'system_module_form',
      param: { expandIds: [...scopeMenuIds.value], ...param },
      afterOk: async () => {
        await reloadTable();
      },
    });
  };

  // 按钮点击事件
  const buttonClick = {
    add: () => {
      openModuleForm({ title: t('新增功能') });
    },
    edit: (row) => {
      openModuleForm({ title: t('编辑功能'), isEdit: true, row });
    },
    delete: ({ f_FullName, f_ModuleId }) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${f_FullName}】${t('吗')}`,
        onOk: async () => {
          await moduleApi.remove(f_ModuleId);
          await loadList();
          success(t('删除成功'));
          refreshTable();
        },
      });
    },
  };

  // 页面权限处理
  const { getButtons, getColumns } = useAuth(pageInfo, { buttonClick });

  // 目录切换只刷新数据，保留名称查询条件（resetData 会清空查询条件，导致目录树回弹）
  const refreshTable = async () => {
    await getRef('mainTable').refreshData();
  };

  // 增删改后菜单清单已变化，先重载菜单再刷新数据
  const reloadTable = async () => {
    await loadList();
    await refreshTable();
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
            const res = await moduleApi.updateState(row.f_ModuleId, row.f_EnabledMark);
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
            title: '功能目录',
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',
              config: {
                defaultExpandAll: false,
                valueKey: 'f_ModuleId',
                labelKey: 'f_FullName',
                pidKey: 'f_ParentId',
                list: treeList,
                click: (node) => {
                  if (node && node.length > 0) {
                    moduleId = node[0];
                  } else {
                    moduleId = '0';
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
            mode: 'serve',
            columns: getColumns(columnsConfig),
            rowKey: 'f_ModuleId',
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: true,
            notSearchBtn: true,
            searchInputList: [
              {
                id: 'f_FullName',
                type: 'input',
                config: {
                  isQuickSearch: true,
                  immediate: true,
                  label: '名称',
                  width: 160,
                  placeholder: '请输入菜单名称',
                },
              },
            ],
            loadData: async (param, isRefreshBtn) => {
              if (isRefreshBtn) {
                await loadList();
              }
              const keyword = String(param?.f_FullName || '').trim();
              nameFilter.value = keyword;

              const visibleTreeIds = getVisibleTreeIds(keyword);
              if (moduleId !== '0' && !visibleTreeIds.has(moduleId)) {
                moduleId = '0';
                getRef('tree')?.setValue([]);
              }

              // 名称查询时展开命中路径，否则深层命中项会藏在折叠目录里
              if (keyword) {
                await nextTick();
                getRef('tree')?.setExpandedKeys([...visibleTreeIds]);
              }

              const matchedIds = getKeywordIds(keyword);

              // 无关键字：只列当前目录的直属子菜单
              if (!matchedIds) {
                const list = getAllModuleGroup.value[moduleId] || [];
                return list.filter((item) => scopeMenuIds.value.has(item.f_ModuleId));
              }

              // 有关键字：在整棵功能目录中按名称命中，并按当前目录限定到其子树（任意层级）
              const moduleById = new Map(
                getAllModuleList.value.map((item) => [item.f_ModuleId, item]),
              );
              const isInSubtree = (item: { f_ModuleId: string; f_ParentId: string }) => {
                if (moduleId === '0') {
                  return true;
                }
                const visited = new Set<string>();
                let current = moduleById.get(item.f_ModuleId);
                while (current && !visited.has(current.f_ModuleId)) {
                  if (current.f_ModuleId === moduleId) {
                    return true;
                  }
                  visited.add(current.f_ModuleId);
                  current = moduleById.get(current.f_ParentId);
                }
                return false;
              };
              return getAllModuleList.value.filter(
                (item) =>
                  matchedIds.has(item.f_ModuleId) &&
                  scopeMenuIds.value.has(item.f_ModuleId) &&
                  isInSubtree(item),
              );
            },
          },
        },
      ],
    },
  ]);

  onMounted(async () => {
    await loadList();
  });
</script>
