<template>
  <div class="lr-block" style="min-height: 60px" ref="treeDivRef">
    <a-spin :spinning="loading">
      <a-tree
        v-if="!loading && treeData.length > 0"
        v-model:selectedKeys="selectedKeys"
        v-model:checkedKeys="checkedKeys"
        v-model:expandedKeys="expandedKeys"
        :tree-data="treeData"
        :default-expand-all="defaultExpandAll"
        :field-names="{
          title: 'label',
          key: 'value',
        }"
        :checkable="checkable"
        @select="handleNodeClick"
        @check="handleNodeCheck"
        :show-icon="showIcon"
        :height="isHeightAuto ? undefined : treeHeight || 60"
      >
        <template #title="prop">
          <a-dropdown :trigger="['contextmenu']">
            <div>
              <lr-icon
                v-if="prop[iconKey] || defaultIcon"
                :size="18"
                :icon="prop[iconKey] || defaultIcon || ''"
                :is-div="false"
                :color="prop[iconColorKey] || defaultIconColor || ''"
              />
              <span>{{ $t(prop.label || '') }}</span>
            </div>
            <template #overlay>
              <a-menu v-if="buttonGroup(prop).length">
                <a-menu-item
                  v-for="(item, index) in buttonGroup(prop)"
                  :key="index"
                  :disabled="item.disabled"
                  @click.stop="handleBtnClick(item.prop, item, prop)"
                >
                  <lr-icon
                    :icon="item.icon || buttonDefaultIcon"
                    :is-div="false"
                    :style="{
                      color: item.danger
                        ? 'var(--color-error-text)'
                        : item.color || buttonIconColor || 'var(--color-primary)',
                      'margin-right': '2px',
                    }"
                    v-if="item.icon || buttonDefaultIcon"
                  />
                  <button
                    :class="['lr-table-btn', { dangerous: item.danger }]"
                    :disabled="item.disabled"
                  >
                    {{ $t(item.label || '') }}
                  </button>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </a-tree>
      <div
        class="lr-block"
        style="display: flex; align-items: center; justify-content: center"
        v-else
      >
        <a-empty :description="$t(emptyDes)" />
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref, unref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
  import type { buttonItem } from '../buttons/interface';
  import { createNamespace } from '../utils/components';
  import { toTree, toArray } from '../utils/tree';
  import { useFramework } from '../utils/useFramework';
  import { deepClone } from '../utils/method';

  defineOptions({ name: createNamespace('tree').name });

  const props = defineProps({
    // 方法
    /**
     * @zh 加载数据方法
     */
    loadData: Function,
    /**
     * @zh 加载数据后
     */
    afterLoadData: Function,
    /**
     * @zh 点击方法
     */
    click: Function,
    /**
     * @zh 是否立即执行加载数据
     */
    immediate: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否全部展开
     */
    defaultExpandAll: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 显示字段
     */
    labelKey: {
      type: String,
      default: 'label',
    },
    /**
     * @zh 值字段
     */
    valueKey: {
      type: String,
      default: 'value',
    },
    /**
     * @zh 父级字段
     */
    pidKey: {
      type: String,
      default: 'pid',
    },
    /**
     * @zh id字段
     */
    idKey: {
      type: String,
    },
    /**
     * @zh 数据
     */
    list: {
      type: Array as PropType<any[]>,
    },
    /**
     * @zh 数据类型
     */
    dataType: String,
    /**
     * @zh 数据编码
     */
    dataCode: String,
    /**
     * @zh 是否可选择
     */
    checkable: Boolean,
    /**
     * @zh 勾选方法
     */
    check: Function,
    /**
     * @zh 空状态数据描述
     */
    emptyDes: {
      type: String,
      default: '暂无数据',
    },
    /**
     * @zh 是否树形结构数据
     */
    isTreeData: Boolean,
    /**
     * @zh 是否展示 TreeNode 前的图标，没有默认样式，如设置为 true，需要自行定义图标相关样式
     */
    showIcon: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 设置该组件的默认图标（优先使用节点数据中自定义的图标）
     */
    defaultIcon: {
      type: String,
      default: '',
    },
    /**
     * @zh 图标字段
     */
    iconKey: {
      type: String,
      default: 'nodeIcon',
    },
    /**
     * @zh 图标颜色字段
     */
    iconColorKey: {
      type: String,
      default: 'iconColor',
    },
    /**
     * @zh 设置该组件的默认图标颜色（优先使用节点数据中自定义的图标颜色）
     */
    defaultIconColor: {
      type: String,
      default: '',
    },
    /**
     * @zh 树按钮(右击显示)
     */
    treeButtons: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
    /**
     * @zh 处理按钮
     */
    setButton: Function,
    /**
     * @zh 树按钮默认图标
     */
    buttonDefaultIcon: {
      type: String,
      default: '',
    },
    /**
     * @zh 树按钮图标默认颜色
     */
    buttonIconColor: {
      type: String,
      default: '',
    },

    /**
     * @zh 执行事件编排方法
     */
    runFlow: {
      type: Function,
    },
    /**
     * @zh 事件编排
     */
    nodeClickFlow: {
      type: String,
    },
    /**
     * @zh 是否根据高度自动调整（关闭虚拟滚动）
     */
    isHeightAuto: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits({
    /**
     * @zh 点击按钮时触发
     * @property {string} prop
     */
    click: (prop: string) => true,
  });

  const {
    getDataItemOptions,
    getDataItemList,
    loadDataItemList,
    getDataItem,

    getDbSourceList,
    loadDbSourceList,
    getDbSourceOptions,

    useData,
  } = useFramework({});

  const useDataRes = useData();

  const loading = ref(false);
  const selectedKeys = ref([]);

  const treeList = ref([]);

  const checkedKeys = ref<string[]>([]);

  const treeDataByDataType = computed(() => {
    if (props.dataType === 'dataItem' && getDataItem) {
      return getDataItemOptions(getDataItemList(props.dataCode || ''));
    }

    if (props.dataType === 'dataSource') {
      return getDbSourceOptions(
        getDbSourceList.value[props.dataCode || ''],
        props.valueKey,
        props.labelKey,
        '',
        props.idKey || props.valueKey,
        props.pidKey,
      );
    }

    if (useDataRes) {
      return useDataRes.getData(props.dataType, props.dataCode, { notLoad: true }) || [];
    }

    return [];
  });

  const treeData = computed(() => {
    if (props.dataCode) {
      return treeDataByDataType.value;
    }

    if (props.list) {
      if (props.isTreeData) {
        return unref(props.list);
      }

      return toTree(
        unref(props.list),
        props.idKey || props.valueKey,
        props.pidKey,
        props.valueKey,
        props.labelKey,
      );
    }

    if (props.isTreeData) {
      return treeList.value;
    }

    return toTree(
      treeList.value,
      props.idKey || props.valueKey,
      props.pidKey,
      props.valueKey,
      props.labelKey,
    );
  });

  const pRefreshData = async () => {
    loading.value = true;
    if (props.loadData) {
      treeList.value = (await props.loadData()) || [];
    }

    if (props.dataType === 'dataItem' && loadDataItemList) {
      await loadDataItemList(props.dataCode, false);
    }

    if (props.dataType === 'dataSource' && loadDbSourceList) {
      await loadDbSourceList(props.dataCode, undefined, false);
    }

    if (props.dataType && props.dataCode && useDataRes?.loadData) {
      await useDataRes.loadData(props.dataType, props.dataCode, false);
    }

    loading.value = false;

    nextTick(() => {
      props.afterLoadData && props.afterLoadData(treeData.value || [], treeList.value || []);
    });
  };

  const pSetValue = (value: any) => {
    selectedKeys.value = value;
  };

  const pSetCheck = (value: string[]) => {
    checkedKeys.value = value;
  };

  const pGetCheck = () => checkedKeys.value;
  const handleNodeClick = async (nodes: string[], e: any) => {
    if (props.nodeClickFlow && props.runFlow) {
      const flowObj = JSON.parse(props.nodeClickFlow);
      await props.runFlow(flowObj, { value: nodes[0] });
    }
    props.click && props.click(nodes, e);
  };
  const handleNodeCheck = (checkedKeys: string[], e: any) => {
    props.check && props.check(checkedKeys, e);
  };

  const arrayData = computed(() => toArray(treeData.value));
  const expandedKeys = ref();
  const pSetExpandedKeys = (value: string[]) => {
    const setKeys = value || [];
    let expandKeys: any[] = [];
    setKeys.forEach((key) => {
      const keys = findAncestorsByValue('_id', '_pid', arrayData.value, key, expandKeys);
      expandKeys = expandKeys.concat(keys);
    });
    expandedKeys.value = [...new Set([...expandKeys, ...setKeys])];
  };
  const pGetExpandedKeys = () => expandedKeys.value;

  const findAncestorsByValue = (
    id: string,
    pid: string,
    data: any[],
    targetValue: string,
    filterVal: any[],
  ) => {
    const ancestors: any[] = [];
    const nodeMap: any = {};

    data.forEach((node) => {
      nodeMap[node[id]] = node;
    });

    const targetNode = data.find((node) => node.value === targetValue);
    if (targetNode) {
      findAncestors(id, pid, targetNode[id], nodeMap, ancestors, filterVal);
    }

    return ancestors;
  };

  const findAncestors = (
    id: string,
    pid: string,
    nodeId: string | number,
    nodeMap: any,
    ancestors: string[],
    filterVal: any[],
  ) => {
    const node = nodeMap[nodeId];
    if (!node) return;
    if (node[pid] !== '0' && node[pid]) {
      if (filterVal.includes(nodeMap[node[pid]]?.value)) {
        return;
      }
      findAncestors(id, pid, node[pid], nodeMap, ancestors, filterVal);
      ancestors.unshift(nodeMap[node[pid]].value);
    }
  };

  const buttonGroup = (row?: Record<string, any>) => {
    const btns = deepClone(props.treeButtons);

    // 处理按钮数据
    if (row && props.setButton) {
      props.setButton({ buttons: btns, row });
    }
    return btns;
  };
  const handleBtnClick = (prop: string, btn: buttonItem, row: Record<string, any>) => {
    if (btn.disabled) return;
    btn.click && btn.click(row);
    emit('click', prop);
  };

  const treeDivRef = ref();
  const treeHeight = ref();
  let resizeObserver: any = null;

  onMounted(async () => {
    if ((props.immediate && props.loadData) || (props.dataType && props.dataCode)) {
      await pRefreshData();
    }

    if (treeDivRef.value) {
      // 创建 ResizeObserver 实例
      resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const { height } = entry.contentRect;
          treeHeight.value = height;
        });
      });

      // 开始观察目标元素
      resizeObserver.observe(treeDivRef.value);
    }
  });
  onBeforeUnmount(() => {
    // 组件卸载时，停止观察
    if (resizeObserver && treeDivRef.value) {
      resizeObserver.unobserve(treeDivRef.value);
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });

  watch(
    () => props.list,
    () => {
      loading.value = true;
      nextTick(() => {
        loading.value = false;
      });
    },
  );

  watch(
    () => props.dataCode,
    () => {
      pRefreshData();
    },
  );

  /**
   * @zh 刷新数据
   */
  async function refreshData() {
    await pRefreshData();
  }
  /**
   * @zh 设置数据值
   */
  function setValue(value: any) {
    pSetValue(value);
  }
  /**
   * @zh 设置数据值
   */
  function setCheck(value: string[]) {
    pSetCheck(value);
  }
  /**
   * @zh 获取数据值
   */
  function getCheck() {
    return pGetCheck();
  }
  /**
   * @zh 设置展开的树节点
   */
  function setExpandedKeys(value: string[]) {
    pSetExpandedKeys(value);
  }
  /**
   * @zh 获取展开的树节点
   */
  function getExpandedKeys() {
    return pGetExpandedKeys();
  }

  defineExpose({
    refreshData,
    setValue,
    setCheck,
    getCheck,
    setExpandedKeys,
    getExpandedKeys,
  });
</script>

<style lang="less">
  @import './tree';
</style>
