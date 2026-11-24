<template>
  <a-divider :orientation="align" :dashed="dashed">
    <span>{{ $t(content || '') }}</span>
  </a-divider>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('divider').name });

  defineProps({
    /**
     * @zh 文本内容
     */
    content: {
      type: String,
    },
    /**
     * @zh 是否虚线
     */
    dashed: Boolean,
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
</script>

<style lang="less">
  @import './divider';
</style>
