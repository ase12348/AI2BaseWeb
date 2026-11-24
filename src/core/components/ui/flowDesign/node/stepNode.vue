<template>
  <a-dropdown v-model:open="visibleContextmenu" destroy-popup-on-hide :trigger="['contextmenu']">
    <div class="flow-step">
      <div
        class="flow-step-icon"
        :style="{ backgroundColor: flowComponent.iconColor || 'var(--color-primary)' }"
      >
        <lr-icon :icon="flowComponent.icon || 'ant-design:branches-outlined'" :is-div="true" />
      </div>
      <div class="flow-step-name">{{ $t(flowComponent.name) }}</div>
      <a-tooltip
        placement="top"
        :arrow="false"
        destroy-tooltip-on-hide
        :mouse-leave-delay="0"
        color="var(--color-bg-container)"
        v-if="data.type != 'start'"
      >
        <template #title>
          <div v-if="isShowAddNodeButton" style="color: var(--color-text-secondary)">
            <span style="color: var(--color-text); font-weight: bold">点击</span>添加节点
          </div>
          <div style="color: var(--color-text-secondary)">
            <span style="color: var(--color-text); font-weight: bold">拖拽</span>连接节点
          </div>
        </template>
        <Handle
          @click="handleOpenAddNodeMenus('t1')"
          @mousedown="handleMouseDown"
          id="t1"
          :class="[
            'flow-step-target-handle',
            { 'flow-step-target-handle-notadd': !isShowAddNodeButton },
          ]"
          type="target"
          :position="Position.Left"
          :is-valid-connection="isValidConnection"
        >
          <a-popover
            v-model:open="visibleAddNodeMenu.t1"
            :arrow="false"
            placement="left"
            trigger="click"
          >
            <template #content>
              <NodeMenus handle-id="t1" :from-node-id="id" @add-node="handleAddNode" />
            </template>
            <lr-icon
              class="flow-step-source-handle-plus"
              icon="ant-design:plus-circle-filled"
              color="var(--color-primary)"
            />
          </a-popover>
        </Handle>
      </a-tooltip>
      <a-tooltip
        placement="top"
        :arrow="false"
        destroy-tooltip-on-hide
        :mouse-leave-delay="0"
        color="var(--color-bg-container)"
      >
        <template #title>
          <div style="color: var(--color-text-secondary)">
            <span style="color: var(--color-text); font-weight: bold">点击</span>添加节点
          </div>
          <div style="color: var(--color-text-secondary)">
            <span style="color: var(--color-text); font-weight: bold">拖拽</span>连接节点
          </div>
        </template>
        <Handle
          @click="handleOpenAddNodeMenus('s1')"
          @mousedown="handleMouseDown"
          id="s1"
          class="flow-step-source-handle"
          type="source"
          :position="Position.Right"
          :is-valid-connection="isValidConnection"
        >
          <a-popover
            v-model:open="visibleAddNodeMenu.s1"
            :arrow="false"
            placement="right"
            trigger="click"
          >
            <template #content>
              <NodeMenus handle-id="s1" :from-node-id="id" @add-node="handleAddNode" />
            </template>
            <lr-icon
              class="flow-step-source-handle-plus"
              icon="ant-design:plus-circle-filled"
              color="var(--color-primary)"
            />
          </a-popover>
        </Handle>
      </a-tooltip>
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item v-if="data.type != 'start'" @click="handleDeleteNode">{{
          $t('删除')
        }}</a-menu-item>
        <a-menu-divider v-if="data.type != 'start' && flowComponent.des" />
        <div v-if="flowComponent.des" style="width: 160px; padding: 4px 10px 0">
          <a-typography-paragraph type="secondary" style="margin-bottom: 4px">{{
            $t('关于')
          }}</a-typography-paragraph>
          <a-typography-paragraph>{{ flowComponent.des }}</a-typography-paragraph>
        </div>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script lang="ts" setup>
  import { ref, computed, inject } from 'vue';
  import { Handle, Position, useVueFlow } from '@vue-flow/core';
  import NodeMenus from '../nodeMenus.vue';

  const {
    onNodeClick,
    onEdgeClick,
    onMoveStart,
    onConnectStart,
    onNodeDragStart,
    removeNodes,
    getEdges,
    getNodes,
    onNodesChange,
  } = useVueFlow();

  // 获取注入的方法
  const { onRemoveNode, getFlowComponentMap } = inject(
    'jcode_flow_design_provide',
    {} as Record<string, any>,
  );

  const props = defineProps({
    /**
     * @zh 节点id
     */
    id: {
      type: String,
      required: true,
    },
    /**
     * @zh 节点数据
     */
    data: {
      type: Object,
      required: true,
    },
  });

  const flowComponent = computed(() => getFlowComponentMap.value[props.data.type]);

  // 节点删除
  const handleDeleteNode = () => {
    removeNodes(props.id);
    onRemoveNode(props.id);
  };

  // 打开节点添加菜单
  const visibleAddNodeMenu = ref<Record<string, boolean>>({});

  onNodesChange((nodes) => {
    if (props.data.isInit) {
      if (
        nodes.findIndex(
          (t) => t.type === 'select' && t.id === props.id && t.id === 'start' && t.selected,
        ) !== -1
      ) {
        const startNode = getNodes.value.find((t) => t.id === 'start');
        if (startNode) {
          startNode.data.isInit = false;
        }
        visibleAddNodeMenu.value.s1 = true;
      }
    }
  });

  const clickHandlePlus = ref(false);
  const handleOpenAddNodeMenus = (id: string) => {
    if (id.indexOf('t') !== -1 && !isShowAddNodeButton.value) {
      return;
    }

    clickHandlePlus.value = true;
    visibleAddNodeMenu.value[id] = true;
  };

  // 判断节点连接点是否可显示添加按钮
  const isShowAddNodeButton = computed(
    () => getEdges.value.findIndex((t) => t.target === props.id) === -1,
  );

  // 校验是否可添加连线
  const notConnection = ref(false);
  const handleMouseDown = () => {
    notConnection.value = true;
  };

  // 判断目前是否是源的父级
  const isValidParent = (source: string, target: string) => {
    const edge = getEdges.value.find((t) => t.source === target && t.target === source);
    if (edge) {
      return true;
    }
    const edges = getEdges.value.filter((t) => t.target === source);
    for (let i = 0; i < edges.length; i++) {
      const res = isValidParent(edges[i].source, target);
      if (res) {
        return true;
      }
    }

    return false;
  };

  const isValidConnection = (connection: any) => {
    if (notConnection.value) {
      notConnection.value = false;
      return false;
    }

    if (isValidParent(connection.source, connection.target)) {
      return false;
    }

    if (
      connection.source !== connection.target &&
      connection.sourceHandle !== connection.targetHandle &&
      connection.sourceHandle.indexOf('s') !== -1 &&
      connection.targetHandle.indexOf('t') !== -1
    ) {
      return true;
    }
    return false;
  };

  // 右键菜单
  const visibleContextmenu = ref(false);

  // 节点添加菜单关闭
  const closeNodeMenu = () => {
    visibleContextmenu.value = false;
    Object.keys(visibleAddNodeMenu.value).forEach((key) => {
      visibleAddNodeMenu.value[key] = false;
    });
  };
  const handleAddNode = () => {
    closeNodeMenu();
  };

  onNodeClick(() => {
    if (clickHandlePlus.value) {
      clickHandlePlus.value = false;
    } else {
      closeNodeMenu();
    }
  });
  onEdgeClick(() => {
    closeNodeMenu();
  });
  onMoveStart(() => {
    closeNodeMenu();
  });
  onConnectStart(() => {
    closeNodeMenu();
  });
  onNodeDragStart(() => {
    closeNodeMenu();
  });
</script>
