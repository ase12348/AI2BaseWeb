<template>
  <div
    :class="[
      'lr-drag-container',
      {
        selected: isSelect && !isComponentContainer,
        hovered: isHover && !isComponentContainer,
        isTopLevel: componentData.level === 0,
        active: isActive,
        isMoveingInTopLevel: isMoveingInTopLevel,

        isTopActive: isTopActive,
        isBottomActive: isBottomActive,
      },
    ]"
    ref="refDrag"
  >
    <div class="lr-drag-line" v-if="!isComponentContainer"></div>
    <div class="lr-drag-btns" v-if="!isComponentContainer">
      <div class="lr-drag-btns-names" @click.stop="() => {}">
        <lr-button class="lr-drag-btn" type="primary" size="small">{{
          $t(componentData.name)
        }}</lr-button>
      </div>
    </div>
    <div
      class="lr-drag-body"
      @click.stop="activeComponent"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { DesignComponent } from './interface';
  import { PropType, ref, computed } from 'vue';
  import { createNamespace } from '../utils/components';
  import { useDrag } from './hooks/useDrag';

  defineOptions({ name: createNamespace('dragContainer').name });

  const props = defineProps({
    /**
     * @zh 配置项
     */
    componentData: {
      type: Object as PropType<DesignComponent>,
      default: () => ({}),
    },
    /**
     * @zh 是否是组件的容器
     */
    isComponentContainer: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 容器所在分类id
     */
    groupId: String,
  });

  const refDrag = ref();
  const childComponents = computed(
    () => (props.componentData.children || []) as Record<string, any>[],
  );

  const {
    onMouseenter,
    onMouseleave,
    activeComponent,
    isHover,
    isSelect,
    isToContainer,
    isMoveingInTopLevel,
    isTopActive,
    isBottomActive,
  } = useDrag(
    refDrag,
    props.componentData,
    'container',
    childComponents,
    props.isComponentContainer,
    props.groupId,
  );

  const isActive = computed(() => {
    if (
      childComponents.value.findIndex((t) => t.groupId === props.groupId) === -1 &&
      isToContainer.value
    ) {
      return true;
    }
    return false;
  });
</script>
