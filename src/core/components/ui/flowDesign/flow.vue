<template>
  <VueFlow
    :min-zoom="0.2"
    :max-zoom="4"
    :default-viewport="{ zoom: 1 }"
    :connection-mode="ConnectionMode.Strict"
    :nodes="nodes"
    :edges="edges"
  >
    <template #edge-button="buttonEdgeProps">
      <EdgeWithButton
        :id="buttonEdgeProps.id"
        :source-x="buttonEdgeProps.sourceX"
        :source-y="buttonEdgeProps.sourceY"
        :target-x="buttonEdgeProps.targetX"
        :target-y="buttonEdgeProps.targetY"
        :source-position="buttonEdgeProps.sourcePosition"
        :target-position="buttonEdgeProps.targetPosition"
        :marker-end="buttonEdgeProps.markerEnd"
        :style="buttonEdgeProps.style"
      />
    </template>
    <template #node-step="props">
      <StepNode v-bind="props" />
    </template>
    <Controls position="bottom-left" />
    <Background />
  </VueFlow>
</template>

<script lang="ts" setup>
  import type { Node, Edge } from '@vue-flow/core';
  import { PropType } from 'vue';
  import { VueFlow, ConnectionMode } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { Controls } from '@vue-flow/controls';
  import StepNode from './node/stepNode.vue';
  import EdgeWithButton from './edge/edgeWithButton.vue';

  import '@vue-flow/core/dist/style.css';
  import '@vue-flow/core/dist/theme-default.css';
  import '@vue-flow/controls/dist/style.css';

  defineProps({
    nodes: {
      type: Array as PropType<Node[]>,
      default: () => [],
    },
    edges: {
      type: Array as PropType<Edge[]>,
      default: () => [],
    },
  });
</script>
