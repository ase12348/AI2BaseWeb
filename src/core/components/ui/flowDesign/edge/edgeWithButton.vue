<script lang="ts" setup>
  import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core';
  import { ref, computed } from 'vue';

  import NodeMenus from '../nodeMenus.vue';

  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
    sourceX: {
      type: Number,
      required: true,
    },
    sourceY: {
      type: Number,
      required: true,
    },
    targetX: {
      type: Number,
      required: true,
    },
    targetY: {
      type: Number,
      required: true,
    },
    sourcePosition: {
      type: String,
      required: true,
    },
    targetPosition: {
      type: String,
      required: true,
    },
    markerEnd: {
      type: String,
      required: false,
    },
    style: {
      type: Object,
      required: false,
    },
  });

  const {
    onEdgeMouseEnter,
    onEdgeMouseLeave,
    onNodeClick,
    onEdgeClick,
    onMoveStart,
    onConnectStart,
    onNodeDragStart,
  } = useVueFlow();

  // @ts-ignore
  const path = computed(() => getBezierPath(props));
  const isShowAddButton = ref(false);
  onEdgeMouseEnter(({ edge }) => {
    if (edge.id === props.id) {
      isShowAddButton.value = true;
    }
  });
  onEdgeMouseLeave(() => {
    isShowAddButton.value = false;
  });

  const visibleAddNodeMenu = ref(false);
  const closeNodeMenu = () => {
    visibleAddNodeMenu.value = false;
  };
  const handleOpenMenu = () => {
    visibleAddNodeMenu.value = true;
  };

  const handleAddNode = () => {
    closeNodeMenu();
  };

  onNodeClick(() => {
    closeNodeMenu();
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

<template>
  <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
  <BaseEdge :id="id" :style="style" :path="path[0]" :marker-end="markerEnd" />

  <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
  <EdgeLabelRenderer>
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      class="nodrag nopan"
    >
      <a-popover v-model:open="visibleAddNodeMenu" :arrow="false" placement="right" trigger="click">
        <template #content>
          <NodeMenus handle-id="line" :from-node-id="id" @add-node="handleAddNode" />
        </template>
        <div
          @click="handleOpenMenu"
          v-show="isShowAddButton || visibleAddNodeMenu"
          class="flow-edge-button"
        >
          <lr-icon icon="ant-design:plus-circle-filled" color="var(--color-primary)" />
        </div>
      </a-popover>
    </div>
  </EdgeLabelRenderer>
</template>
