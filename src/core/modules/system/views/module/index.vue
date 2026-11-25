<template>
  <div class="module-page">
    <div class="terminal-bar">
      <div
        v-for="item in terminalTabs"
        :key="item.value"
        class="terminal-tab"
        :class="{ 'is-active': currentTerminal === item.value }"
        @click="switchTerminal(item.value)"
      >
        <span class="terminal-tab__label">{{ $t(item.label) }}</span>
        <span class="terminal-tab__count">{{ item.count }}</span>
      </div>
    </div>
    <div class="module-page__body">
      <lr-c-schema-index ref="indexRef" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import type { ColConfig } from '/#/page';
  import { ref, h, computed, nextTick, onMounted } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { useDataItem } from '/@/core/hooks/data/useDataItem';
  import { api as moduleApi } from '/@/core/modules/system/api/module';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  const { loadList } = useMenu();

  /** 终端类型：0 电脑端 / 1 移动端，与 lr_base_module.F_TerminalType 对应 */
  const TERMINALS = [
    { value: 0, label: '电脑端' },
    { value: 1, label: '移动端' },
  ];

  const currentTerminal = ref(0);
  /** 两个终端各自维护一份菜单数据，互不干扰 */
  const terminalLists = ref<Record<number, any[]>>({ 0: [], 1: [] });

  /** 顶部终端切换（带数量） */
  const terminalTabs = computed(() =>
    TERMINALS.map((item) => ({
      ...item,
      count: (terminalLists.value[item.value] || []).length,
    })),
  );

  const currentList = computed(() => terminalLists.value[currentTerminal.value] || []);
  const currentScopeIds = computed(() => new Set(currentList.value.map((item) => item.f_ModuleId)));

  const loadTerminal = async (terminal: number) => {
    const list = (await moduleApi.getList({ terminalType: terminal })) || [];
    terminalLists.value = { ...terminalLists.value, [terminal]: list };
    return list;
  };

  const nameFilter = ref('');

  /** 移动端分类：取数据字典「移动功能」(function) 的明细，与 App 端分组一致 */
  const { loadDataItemList, getDataItem } = useDataItem();
  const categoryList = computed(() =>
    (getDataItem.value['function'] || []).map((item) => ({
      f_ModuleId: item.f_ItemValue,
      f_ParentId: '0',
      f_FullName: item.f_ItemName,
    })),
  );
  const loadCategory = async () => {
    await loadDataItemList('function');
  };

  /** 名称命中的菜单主键；空关键字返回 null 表示不过滤 */
  const getKeywordIds = (list: any[], keyword: string) => {
    const value = keyword.trim().toLowerCase();
    if (!value) {
      return null;
    }
    return new Set(
      list
        .filter((item) => (item.f_FullName || '').toLowerCase().includes(value))
        .map((item) => item.f_ModuleId),
    );
  };

  /** 目录可见集合：范围内（且命中名称）的菜单，连同它们的祖先目录 */
  const getVisibleTreeIds = (list: any[], keyword: string) => {
    const matched = getKeywordIds(list, keyword);
    const moduleById = new Map(list.map((item) => [item.f_ModuleId, item]));
    const visible = new Set<string>();
    list.forEach((item) => {
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

  /** 左侧树数据源：电脑端是功能目录，移动端是数据字典 function 里的分类 */
  const treeList = computed(() => {
    if (currentTerminal.value === 1) {
      return categoryList.value;
    }
    const list = currentList.value;
    const visible = getVisibleTreeIds(list, nameFilter.value);
    return list.filter((item) => item.f_Target === 'expand' && visible.has(item.f_ModuleId));
  });

  /** 左侧面板标题随终端变化 */
  const leftPanelTitle = computed(() =>
    currentTerminal.value === 1 ? t('功能分类') : t('功能目录'),
  );

  const groupByParent = (list: any[]) => {
    const group: Record<string, any[]> = {};
    list.forEach((item) => {
      group[item.f_ParentId] = group[item.f_ParentId] || [];
      group[item.f_ParentId].push(item);
    });
    return group;
  };

  let moduleId = '0';

  const treeClick = (node: any[]) => {
    moduleId = node && node.length > 0 ? node[0] : '0';
    refreshTable();
  };

  // 打开表单：把当前范围（终端 + 当前终端内可见的目录）一起传进去
  const openModuleForm = (options: Record<string, any>) => {
    const { title, ...param } = options;
    const terminal = currentTerminal.value;
    const expandList = (terminalLists.value[terminal] || []).filter(
      (item) => item.f_Target === 'expand',
    );
    openForm({
      title,
      name: 'system_module_form',
      // 移动端带按钮/列表字段/表单字段三个配置页签，弹窗需要更大
      width: terminal === 1 ? 900 : 600,
      height: terminal === 1 ? 640 : 460,
      param: {
        expandIds: [...currentScopeIds.value],
        expandList,
        terminalType: terminal,
        // 移动端：新增时默认带上左侧选中的分类
        category: terminal === 1 && moduleId !== '0' ? moduleId : '',
        ...param,
      },
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
          await reloadTable();
          success(t('删除成功'));
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

  // 增删改后菜单清单已变化，先重载当前终端菜单再刷新数据
  const reloadTable = async () => {
    await loadTerminal(currentTerminal.value);
    if (currentTerminal.value === 0) {
      // 电脑端菜单同时影响左侧导航，需要重载全局菜单
      await loadList();
    }
    await refreshTable();
  };

  // 切换终端：清空目录选中与名称条件，重新按新终端取数
  const switchTerminal = async (terminal: number) => {
    if (terminal === currentTerminal.value) {
      return;
    }
    currentTerminal.value = terminal;
    moduleId = '0';
    nameFilter.value = '';
    await loadTerminal(terminal);
    if (terminal === 1) {
      await loadCategory();
    }
    await nextTick();
    getRef('menuTree')?.setValue([]);
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
            title: leftPanelTitle,
          },
          children: [
            {
              id: 'menuTree',
              type: 'lr-tree',
              config: {
                defaultExpandAll: false,
                valueKey: 'f_ModuleId',
                labelKey: 'f_FullName',
                pidKey: 'f_ParentId',
                list: treeList,
                click: treeClick,
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
                await loadTerminal(currentTerminal.value);
              }
              const keyword = String(param?.f_FullName || '').trim();
              nameFilter.value = keyword;

              const list = currentList.value;

              // 移动端左侧是分类：按分类值（f_Type）过滤，没有层级树
              if (currentTerminal.value === 1) {
                const matchedIds = getKeywordIds(list, keyword);
                return list.filter(
                  (item) =>
                    currentScopeIds.value.has(item.f_ModuleId) &&
                    (moduleId === '0' || item.f_Type === moduleId) &&
                    (!matchedIds || matchedIds.has(item.f_ModuleId)),
                );
              }

              const visibleTreeIds = getVisibleTreeIds(list, keyword);
              if (moduleId !== '0' && !visibleTreeIds.has(moduleId)) {
                moduleId = '0';
                getRef('menuTree')?.setValue([]);
              }

              // 名称查询时展开命中路径，否则深层命中项会藏在折叠目录里
              if (keyword) {
                await nextTick();
                getRef('menuTree')?.setExpandedKeys([...visibleTreeIds]);
              }

              const matchedIds = getKeywordIds(list, keyword);

              // 无关键字：只列当前目录的直属子菜单
              if (!matchedIds) {
                const list = groupByParent(currentList.value)[moduleId] || [];
                return list.filter((item) => currentScopeIds.value.has(item.f_ModuleId));
              }

              // 有关键字：在当前终端菜单中按名称命中，并按当前目录限定到其子树（任意层级）
              const moduleById = new Map(list.map((item) => [item.f_ModuleId, item]));
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
              return list.filter(
                (item) =>
                  matchedIds.has(item.f_ModuleId) &&
                  currentScopeIds.value.has(item.f_ModuleId) &&
                  isInSubtree(item),
              );
            },
          },
        },
      ],
    },
  ]);

  onMounted(async () => {
    await Promise.all([loadTerminal(0), loadTerminal(1), loadCategory()]);
  });
</script>

<style lang="less" scoped>
  .module-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;

    &__body {
      flex: 1;
      min-height: 0;
    }
  }

  // 顶部终端切换条：与下方 panel 的 4px 内边距对齐
  .terminal-bar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    margin: 4px 4px 0;
    padding: 8px 12px;
    border-radius: 4px;
    background-color: var(--color-bg-container);
    gap: 8px;
  }

  .terminal-tab {
    display: inline-flex;
    align-items: center;
    height: 34px;
    padding: 0 14px;
    transition: all 0.2s;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--color-text);
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    gap: 8px;

    &__label {
      line-height: 1;
    }

    &__count {
      min-width: 22px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background-color: var(--color-fill-tertiary);
      color: var(--color-text-tertiary);
      font-size: 12px;
      line-height: 20px;
      text-align: center;
    }

    &:hover:not(.is-active) {
      color: var(--color-primary);
    }

    &.is-active {
      border-color: var(--color-primary);
      background-color: var(--color-primary-bg);
      color: var(--color-primary);
      font-weight: 500;

      .terminal-tab__count {
        background-color: var(--color-primary);
        color: #fff;
      }
    }
  }
</style>
