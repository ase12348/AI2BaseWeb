<template>
  <div
    :class="[
      'lr-drag-component',
      {
        selected: isSelect,
        hovered: isHover,
        isBottomToolBar: isBottomToolBar,
        active: moveActive,

        isTopActive: isTopActive,
        isBottomActive: isBottomActive,
      },
    ]"
  >
    <div class="lr-drag-line"></div>
    <div class="lr-drag-btns" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
      <a-space :size="4">
        <div class="lr-drag-btns-names" @click.stop="() => {}">
          <lr-button class="lr-drag-btn" type="primary" size="small">{{
            $t(componentData.name)
          }}</lr-button>
          <div class="lr-drag-btns-pname">
            <div v-for="btn in getParentComponents(componentData.containerId)" :key="btn.id">
              <lr-button
                class="lr-drag-btn"
                type="primary"
                size="small"
                @click="handleComponentClick(btn.id)"
                >{{ $t(btn.name) }}</lr-button
              >
            </div>
          </div>
        </div>
        <lr-button
          class="lr-drag-btn"
          type="primary"
          size="small"
          @click.stop="copyComponent(componentData.id)"
        >
          <template #icon><lr-icon :size="12" icon="ant-design:copy-outlined" /></template>
        </lr-button>
        <div @contextmenu.stop="onContextmenu" @mousedown.stop="onMousedown">
          <lr-button class="lr-drag-btn" type="primary" size="small">
            <template #icon><lr-icon :size="12" icon="ant-design:drag-outlined" /></template>
          </lr-button>
        </div>
        <lr-button
          class="lr-drag-btn"
          danger
          type="primary"
          size="small"
          @click.stop="deleteComponentByClick(componentData.id)"
        >
          <template #icon><lr-icon :size="12" icon="ant-design:delete-outlined" /></template>
        </lr-button>
      </a-space>
    </div>
    <div
      class="lr-drag-body"
      ref="refDrag"
      @click.stop="activeComponent"
      @contextmenu.stop="onContextmenu"
      @mousedown.stop="onMousedown"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
    >
      <slot></slot>
      <div v-if="!isContainer" class="lr-drag-mask"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { DesignComponent } from './interface';
  import { PropType, ref } from 'vue';
  import { createNamespace } from '../utils/components';
  import { useDrag } from './hooks/useDrag';
  import { useMouseEvent } from './hooks/useMouseEvent';

  defineOptions({ name: createNamespace('dragComponent').name });

  const props = defineProps({
    /**
     * @zh 配置项
     */
    componentData: {
      type: Object as PropType<DesignComponent>,
      default: () => ({}),
    },
    /**
     * @zh 带容器的组件
     */
    isContainer: {
      type: Boolean,
      default: false,
    },
  });

  const refDrag = ref();
  const {
    onMouseenter,
    onMouseleave,
    activeComponent,
    handleComponentClick,
    deleteComponentByClick,
    copyComponent,
    getParentComponents,
    isHover,
    isSelect,
    isTopActive,
    isBottomActive,
    isBottomToolBar,
  } = useDrag(refDrag, props.componentData, 'component');

  const { onContextmenu, onMousedown, moveActive } = useMouseEvent(props.componentData, false);
</script>

<style lang="less">
  @import './drag';
</style>
