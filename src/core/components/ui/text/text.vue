<template>
  <div class="lr-text" :style="styleObj">
    {{ $t(content || '') }}
  </div>
</template>

<script lang="ts" setup>
  import { computed, PropType } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('text').name });

  const props = defineProps({
    /**
     * @zh 文本内容
     */
    content: {
      type: String,
    },
    /**
     * @zh 文本大小
     */
    size: Number,
    /**
     * @zh 文本颜色
     */
    color: String,
    /**
     * @zh 对齐方式
     * @defaultValue center
     */
    align: String as PropType<'left' | 'center' | 'right'>,
    weight: String as PropType<'normal' | 'bold' | 'lighter'>,
    fontStyle: String as PropType<'normal' | 'italic'>,
  });

  const styleObj = computed(() => ({
    fontSize: props.size ? `${props.size}px` : '',
    color: props.color,
    textAlign: props.align,
    fontWeight: props.weight,
    fontStyle: props.fontStyle,
  }));
</script>

<style lang="less">
  @import './text';
</style>
