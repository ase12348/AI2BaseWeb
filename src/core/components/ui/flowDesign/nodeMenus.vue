<template>
  <div class="flow-node-menus" @click.stop="() => {}">
    <div
      v-for="(item, index) of flowComponents"
      :key="index"
      class="flow-node-menus-item"
      @click="handleAddNode(item)"
    >
      <div
        class="flow-node-menus-item-icon"
        :style="{ backgroundColor: item.iconColor || 'var(--color-primary)' }"
      >
        <lr-icon :icon="item.icon || 'ant-design:branches-outlined'" />
      </div>
      <div class="flow-node-menus-item-name">{{ $t(item.name) }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { inject } from 'vue';

  const props = defineProps({
    fromNodeId: String,
    handleId: String,
  });

  const emit = defineEmits(['addNode']);

  // 获取注入的方法
  const { getFlowComponents, addNode, addNodeByLine } = inject(
    'jcode_flow_design_provide',
    {} as Record<string, any>,
  );

  const flowComponents = getFlowComponents();

  const handleAddNode = (item: any) => {
    emit('addNode', item.type);

    if (props.handleId === 'line') {
      addNodeByLine(item.type, props.fromNodeId);
    } else {
      addNode(item.type, props.fromNodeId, props.handleId);
    }
  };
</script>

<style lang="less" scoped>
  .flow-node-menus {
    width: 160px;
    background-color: var(--color-bg-container);

    &-item {
      display: flex;
      align-items: center;
      width: 100%;
      height: 40px;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        background-color: var(--color-fill-tertiary);
      }

      &-name {
        flex: 2;
        width: 0;
        color: var(--color-text-secondary);
        font-size: 14px;
      }

      &-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin: 0 8px;
        border-radius: 8px;
        box-shadow: var(--box-shadow);
        color: #fff;
      }
    }
  }
</style>
