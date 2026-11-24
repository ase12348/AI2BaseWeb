<script setup lang="ts">
  import type { CSSProperties } from 'vue';

  import { computed, PropType, ref, useTemplateRef } from 'vue';

  defineOptions({
    name: 'LrSliderCaptchaBar',
  });

  const props = defineProps({
    /**
     * @zh 滑块条的样式
     */
    barStyle: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    /**
     * @zh 是否回弹到左侧
     */
    toLeft: Boolean,
  });

  const barRef = useTemplateRef<HTMLDivElement>('barRef');

  const width = ref('0');

  const style = computed<CSSProperties>(() => {
    const { barStyle, toLeft } = props;
    return {
      ...barStyle,
      width: toLeft ? '0' : width.value,
      transition: toLeft ? 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
      backgroundColor: 'var(--color-success)',
      position: 'absolute' as const,
      height: '100%',
    };
  });

  defineExpose({
    getEl: () => barRef.value,
    setWidth: (val: string) => {
      width.value = val;
    },
  });
</script>

<template>
  <div ref="barRef" :style="style"></div>
</template>
