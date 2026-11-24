<template>
  <div class="lr-title" :style="styleObj">
    {{ $t(content || '') }}
  </div>
</template>

<script lang="ts" setup>
  import { computed, PropType } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('title').name });

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
  });

  const styleObj = computed(() => ({
    'font-size': props.size ? `${props.size}px` : '',
    color: props.color,
    'text-align': props.align,
  }));
</script>

<style lang="less">
  @import './title';
</style>
