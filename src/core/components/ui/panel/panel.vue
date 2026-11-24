<template>
  <div
    class="lr-block"
    :style="{
      padding: noPadding ? undefined : '4px',
      width: (notSetWidth ? 100 : flexWidth || 100) + '%',
      height: `${height ? height + (unit || '%') : '100%'}`,
    }"
  >
    <div class="lr-panel" :style="{ 'border-radius': noPadding ? '0px' : '4px' }">
      <div class="lr-panel-top" v-if="(title && !notTitle) || (toolBtns && toolBtns.length > 0)">
        <div v-if="!notTitle" class="lr-panel-top-left" :title="$t(title)">
          <slot name="title">
            <a-typography-text ellipsis style="margin: 0; font-size: 14px" :content="$t(title)" />
          </slot>
        </div>

        <a-space :size="0" v-if="toolBtns && toolBtns.length > 0">
          <a-tooltip v-for="btn of toolBtns" :key="btn.prop" placement="top" :title="$t(btn.label)">
            <lr-button @click="handleClick(btn)" type="text">
              <template #icon>
                <lr-icon :icon="btn.icon" />
              </template>
            </lr-button>
          </a-tooltip>
        </a-space>
      </div>
      <div class="lr-panel-body" :style="bodyStyle">
        <slot></slot>
      </div>
      <div
        class="lr-panel-bottom"
        v-if="(bootmBtns && bootmBtns.length > 0) || (bootmRightBtns && bootmRightBtns.length > 0)"
      >
        <lr-buttons :list="bootmBtns" />
        <lr-buttons :list="bootmRightBtns" />
      </div>
    </div>
    <lr-dynamic-layer ref="layerRef" />
  </div>
</template>

<script lang="ts" setup>
  import type { buttonItem } from '../buttons/interface';

  import { ref, PropType, CSSProperties } from 'vue';
  import { createNamespace } from '../utils/components';
  import { useButtons } from '../buttons/useButtons';

  defineOptions({ name: createNamespace('panel').name });
  defineProps({
    /**
     * @zh 标题
     */
    title: {
      type: String as PropType<string>,
    },
    /**
     * @zh 操作按钮
     */
    toolBtns: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
    /**
     * @zh 底部按钮
     */
    bootmBtns: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
    /**
     * @zh 底部右侧按钮
     */
    bootmRightBtns: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
    /**
     * @zh 样式
     */
    bodyStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({
        padding: '8px',
      }),
    },
    /**
     * @zh 是否需要边距
     */
    noPadding: Boolean,
    /**
     * 是否不显示标题
     */
    notTitle: Boolean,
    /**
     * @zh 宽度
     */
    flexWidth: {
      type: Number,
    },
    height: {
      type: Number,
    },
    unit: {
      type: String,
      default: '%',
    },
    notSetWidth: Boolean,
  });

  // 弹窗处理
  const layerRef = ref();
  const { handleClick } = useButtons(layerRef);
</script>

<style lang="less">
  @import './panel';
</style>
