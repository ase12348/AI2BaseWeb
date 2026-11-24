<script setup lang="ts">
  import type { CSSProperties } from 'vue';

  import { computed, PropType, ref, useTemplateRef } from 'vue';

  defineOptions({
    name: 'LrSliderCaptchaAction',
  });

  const props = defineProps({
    /**
     * @zh 滑块的样式
     */
    actionStyle: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    /**
     * @zh 是否验证通过
     */
    isPassing: Boolean,
    /**
     * @zh 是否回弹到左侧
     */
    toLeft: Boolean,
  });

  const actionRef = useTemplateRef<HTMLDivElement>('actionRef');

  const left = ref('0');

  const style = computed<CSSProperties>(() => {
    const { actionStyle, toLeft } = props;
    return {
      ...actionStyle,
      left: toLeft ? '0' : left.value,
      backgroundColor: 'var(--color-bg-container)',
      borderRadius: isDragging.value ? '6px' : undefined,
      transition: toLeft ? 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
    };
  });

  const isDragging = computed(() => {
    const currentLeft = Number.parseInt(left.value as string, 10);

    return currentLeft > 10 && !props.isPassing;
  });

  defineExpose({
    getEl: () => actionRef.value,
    getStyle: () => actionRef?.value?.style,
    setLeft: (val: string) => {
      left.value = val;
    },
  });
</script>

<template>
  <div ref="actionRef" :style="style" class="lr-slider-captcha-action">
    <lr-icon
      v-if="isPassing"
      color="var(--color-text-secondary, var(--color-text))"
      icon="mdi:check-circle-outline"
    />
    <lr-icon
      v-else
      color="var(--color-text-secondary, var(--color-text))"
      icon="mdi:chevron-double-right"
    />
  </div>
</template>
