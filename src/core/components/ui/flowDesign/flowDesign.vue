<template>
  <div class="lr-block lr-flow-design">
    <div class="lr-block" style="flex: 2; width: 0">
      <Flow :nodes="nodes" :edges="edges" />
    </div>
    <div
      v-show="activeNode && myFlowComponentConfigs[activeNode.data.type]"
      class="lr-flow-design-right"
    >
      <div class="lr-flow-design-title">
        <div
          class="lr-flow-design-title-icon"
          :style="{ backgroundColor: activeFlowComponent?.iconColor || 'var(--color-primary)' }"
        >
          <lr-icon :icon="activeFlowComponent?.icon || 'ant-design:branches-outlined'" />
        </div>
        <div class="lr-flow-design-title-name">{{ $t(activeFlowComponent?.name || '') }}</div>
      </div>
      <div class="lr-flow-design-panel">
        <lr-c-schema-form
          :form-config="{
            layout: 'vertical',
          }"
          style="padding: 0"
          ref="configRef"
          @change="handleConfigChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { GraphNode } from '@vue-flow/core';
  import type { SchemaConfig } from '../cSchemaForm/interface';

  import { PropType, ref, provide, computed } from 'vue';
  import { useVueFlow, MarkerType } from '@vue-flow/core';
  import Flow from './flow.vue';
  import { createNamespace } from '../utils/components';
  import { buildShortUUID } from '../utils/method';

  defineOptions({ name: createNamespace('flowDesign').name });

  const props = defineProps({
    /**
     * @zh 组件集合
     */
    components: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },

    /**
     * @zh 输入参数
     */
    inputParams: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },

    /**
     * @zh 编排组件初始化方法
     */
    flowInit: Function,
    /**
     * @zh 组件配置初始化方法
     */
    flowComponentConfigInit: Function,
    /**
     * @zh 编排组件设置方法
     */
    flowComponentConfigs: {
      type: Object as PropType<Record<string, SchemaConfig[]>>,
      default: () => ({}),
    },
    /**
     * @zh 配置值变更方法
     */
    flowComponentConfigChange: Function,
  });

  const {
    addNodes,
    addEdges,
    removeEdges,
    addSelectedNodes,
    removeSelectedNodes,
    onConnect,
    onNodeClick,
    onPaneClick,
    onEdgeClick,

    getNodes,
    getEdges,
  } = useVueFlow();

  const flowComponentMap = computed(() => {
    const res: Record<string, any> = {};
    props.components.forEach((item) => {
      res[item.type] = item;
    });

    res.start = {
      name: '开始',
      type: 'start',
      icon: 'ant-design:play-circle-outlined',
      des: '执行开始节点',
    };

    return res;
  });

  const startNode = {
    id: 'start',
    type: 'step',
    data: { type: 'start', isInit: false },
    position: { x: 80, y: 160 },
  };

  const nodes = ref([startNode]);

  const edges = ref<any[]>([]);

  const getXYPosition = (fromNode: GraphNode<any, any, string>, handleId: string) => {
    if (handleId.indexOf('t') === -1) {
      const fromNodeEdges = getEdges.value.filter((item) => item.source === fromNode.id);

      if (fromNodeEdges.length > 0) {
        // console.log(fromNodeEdges, 'fromNodeEdges')
        let maxY = -1000000;
        let x = 0;
        fromNodeEdges.forEach((item) => {
          maxY = Math.max(
            maxY,
            item.targetNode.position.y + item.targetNode.dimensions.height + 32,
          );
          x = item.targetNode.position.x || 0;
        });

        return {
          x,
          y: maxY,
        };
      }

      return {
        x: fromNode.position.x + fromNode.dimensions.width + 100,
        y: fromNode.position.y,
      };
    }

    return {
      x: fromNode.position.x - 100 - fromNode.dimensions.width,
      y: fromNode.position.y,
    };
  };

  const addNode = (type: string, fromNodeId: string, handleId: string) => {
    const fromNode = getNodes.value.find((item) => item.id === fromNodeId);
    if (!fromNode) {
      return;
    }

    const node = {
      id: buildShortUUID(),
      type: 'step',
      data: {
        type,
      },
      position: getXYPosition(fromNode, handleId),
    };

    if (props.flowInit) {
      const config = props.flowInit(node.data.type);
      if (config) {
        Object.keys(config).forEach((key) => {
          // @ts-ignore
          node.data[key] = config[key];
        });
      }
    }
    addNodes(node);
    if (handleId.indexOf('t') === -1) {
      addEdges({
        id: `${fromNodeId}-${node.id}`,
        source: fromNodeId,
        target: node.id,
        sourceHandle: 's1',
        targetHandle: 't1',
        type: 'button',
        markerEnd: MarkerType.Arrow,
      });
    } else {
      addEdges({
        id: `${fromNodeId}-${node.id}`,
        source: node.id,
        target: fromNodeId,
        sourceHandle: 's1',
        targetHandle: 't1',
        type: 'button',
        markerEnd: MarkerType.Arrow,
      });
    }

    selectNode(node.id);
  };

  const moveOldNodesX = (nodeId: string) => {
    const node = getNodes.value.find((item) => item.id === nodeId);
    if (node) {
      node.position.x += 100 + node.dimensions.width;

      const needMoveEdges = getEdges.value.filter((item) => item.source === nodeId);
      needMoveEdges.forEach((item) => {
        moveOldNodesX(item.target);
      });
    }
  };

  const addNodeByLine = (type: string, edgeId: string) => {
    const fromEdge = getEdges.value.find((item) => item.id === edgeId);
    if (!fromEdge) {
      return;
    }
    const node = {
      id: buildShortUUID(),
      type: 'step',
      data: {
        type,
      },
      position: {
        x: fromEdge.targetNode.position.x,
        y: fromEdge.targetNode.position.y,
      },
    };
    if (props.flowInit) {
      const config = props.flowInit(node.data.type);
      if (config) {
        Object.keys(config).forEach((key: string) => {
          // @ts-ignore
          node.data[key] = config[key];
        });
      }
    }
    addNodes(node);
    addEdges({
      id: `${fromEdge.sourceNode.id}-${node.id}`,
      source: fromEdge.sourceNode.id,
      target: node.id,
      sourceHandle: 's1',
      targetHandle: 't1',
      type: 'button',
      markerEnd: MarkerType.Arrow,
    });
    addEdges({
      id: `${node.id}-${fromEdge.targetNode.id}`,
      source: node.id,
      target: fromEdge.targetNode.id,
      sourceHandle: 's1',
      targetHandle: 't1',
      type: 'button',
      markerEnd: MarkerType.Arrow,
    });
    removeEdges(edgeId);

    // 原先的节点需要向后移动
    moveOldNodesX(fromEdge.target);

    selectNode(node.id);
  };

  onConnect((params) => {
    console.log('on connect', params);
    // @ts-ignore
    params.type = 'button';
    // @ts-ignore
    params.markerEnd = MarkerType.Arrow;
    addEdges(params);
  });

  const getFlowComponents = () => props.components || [];

  // 节点属性配置
  const activeNode = ref<GraphNode<any, any, string>>();
  const activeFlowComponent = computed(() => flowComponentMap.value[activeNode.value?.data.type]);
  onNodeClick((params) => {
    if (activeNode.value?.id !== params.node.id) {
      activeNode.value = params.node;
      flowComponentConfigInit();
    }

    // console.log('onNodeClick', params)
  });
  onPaneClick(() => {
    activeNode.value = undefined;
  });
  onEdgeClick(() => {
    activeNode.value = undefined;
  });

  const onRemoveNode = (nodeId: string) => {
    if (activeNode.value?.id === nodeId) {
      activeNode.value = undefined;
    }
  };

  const selectNode = (nodeId: string) => {
    if (activeNode.value) {
      removeSelectedNodes([activeNode.value]);
    }
    activeNode.value = getNodes.value.find((item) => item.id === nodeId);
    if (activeNode.value) {
      flowComponentConfigInit();
      setTimeout(() => {
        if (activeNode.value) {
          addSelectedNodes([activeNode.value]);
        }
      }, 100);
    }
  };

  const configRef = ref();
  const myFlowComponentConfigs: Record<string, SchemaConfig[]> = {};
  Object.keys(props.flowComponentConfigs).forEach((key) => {
    const collapseItem: SchemaConfig = {
      type: 'collapse',
      config: {
        groups: [],
        defaultValue: [],
      },
      children: [],
    };

    props.flowComponentConfigs[key].forEach((group, index) => {
      const i = `m${index}`;
      collapseItem.config?.defaultValue.push(i);
      collapseItem.config?.groups.push({ i, label: group.config?.label });
      group.children?.forEach((item) => {
        item.slot = i;
        collapseItem.children?.push(item);
      });
    });

    myFlowComponentConfigs[key] = [collapseItem];
  });
  const flowComponentConfigInit = () => {
    const configFormSchema = myFlowComponentConfigs[activeNode.value?.data.type || ''];

    if (configFormSchema) {
      configRef.value.setInit(configFormSchema, activeNode.value?.data);

      if (props.flowComponentConfigInit) {
        props.flowComponentConfigInit({
          configRef,
          inputParams: props.inputParams,
          components: getNodes.value,
          configData: activeNode.value?.data,
        });
      }
    } else {
      configRef.value.setInit([]);
    }
  };

  const handleConfigChange = (
    component: Record<string, any>,
    params: {
      value: any;
      data?: any;
      index?: number;
      tableData?: Record<string, any>[];
      type?: string;
    },
  ) => {
    if (activeNode.value && props.flowComponentConfigChange) {
      props.flowComponentConfigChange(activeNode.value.data.type, {
        configRef,
        component,
        configData: activeNode.value.data,
        ...params,
        isFlowNode: true,
      });
    }
  };

  // 注入方法
  provide('jcode_flow_design_provide', {
    getFlowComponents,
    addNode,
    addNodeByLine,
    onRemoveNode,
    getFlowComponentMap: flowComponentMap,
  });

  const pSetData = (list: Record<string, any>[]) => {
    if (!list || list.length === 0) {
      // @ts-ignore
      startNode.data.isInit = true;
      nodes.value = [startNode];
      selectNode(startNode.id);
    } else {
      startNode.data.isInit = false;
      const nodeList: GraphNode<any, any, string>[] = [];
      const edgeList: any[] = [];
      list.forEach((item) => {
        if (item.type === 'line') {
          item.type = 'button';
          item.markerEnd = MarkerType.Arrow;
          edgeList.push(item);
        } else {
          const node = {
            id: item.id,
            type: item.type,
            data: item.config,
            position: item.position,
          };
          // @ts-ignore
          nodeList.push(node);
        }
      });

      nodes.value = nodeList;
      edges.value = edgeList;
    }
  };

  const pGetData = () => {
    const res: Record<string, any> = [];
    getNodes.value.forEach((item) => {
      res.push({
        config: item.data,
        id: item.id,
        position: item.position,
        type: item.type,
      });
    });
    getEdges.value.forEach((item) => {
      res.push({
        id: item.id,
        source: item.source,
        target: item.target,
        sourceHandle: item.sourceHandle,
        targetHandle: item.targetHandle,
        type: 'line',
      });
    });
    return res;
  };

  /**
   * @public
   * @zh 获取数据
   */
  function getData() {
    return pGetData();
  }
  /**
   * @public
   * @zh 设置数据
   */
  function setData(data: Record<string, any>[]) {
    pSetData(data);
  }

  defineExpose({
    getData,
    setData,
  });
</script>

<style lang="less">
  @import './flowDesign';
</style>
