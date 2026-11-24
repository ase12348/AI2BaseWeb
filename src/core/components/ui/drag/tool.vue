<template>
  <div
    class="lr-drag-tool"
    @click.stop="onClick"
    @contextmenu.stop="onContextmenu"
    @mousedown.stop="onMousedown"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
  import type { FormDesignComponent } from '../formDesign/interface';
  import { PropType } from 'vue';
  import { createNamespace } from '../utils/components';
  import { useMouseEvent } from './hooks/useMouseEvent';

  defineOptions({ name: createNamespace('dragTool').name });

  const props = defineProps({
    /**
     * @zh 配置项
     */
    config: {
      type: Object as PropType<FormDesignComponent>,
      default: () => ({}),
    },
  });

  const { onContextmenu, onMousedown, onClick } = useMouseEvent(props.config, true);
</script>

<style lang="less">
  .lr-drag-tool {
    position: relative;
    cursor: grab;
  }
</style>
