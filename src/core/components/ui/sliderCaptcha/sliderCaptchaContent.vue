<script setup lang="ts">
  import { computed, useTemplateRef } from 'vue';

  defineOptions({
    name: 'LrSliderCaptchaContent',
  });

  const props = defineProps({
    contentStyle: {
      type: Object,
      default: () => ({}),
    },
    isPassing: {
      type: Boolean,
      default: false,
    },
    // 未验证时提示文字
    text: {
      type: String,
      default: '请按住滑块拖动',
    },
    // 验证成功提示文字
    successText: {
      type: String,
      default: '验证成功',
    },
    // 动画持续时间，单位秒
    animationDuration: {
      type: [String, Number],
      default: 2,
    },
    // 动画是否只执行一次
    animationIterationCount: {
      type: [String, Number],
      default: 'infinite',
    },
  });

  const contentRef = useTemplateRef<HTMLDivElement>('contentRef');

  const style = computed(() => {
    const { contentStyle } = props;

    return {
      ...contentStyle,
      fontSize: '12px',
    };
  });

  defineExpose({
    getEl: () => contentRef.value,
  });

  const spineText = computed(() => ({
    animation: `lr-captcha-shine ${props.animationDuration}s linear ${props.animationIterationCount}`,
  }));
</script>

<template>
  <div
    ref="contentRef"
    :class="{ success: isPassing }"
    :style="style"
    class="lr-slider-captcha-content"
  >
    <div :style="spineText" class="lr-spine-text">
      {{ isPassing ? successText : text }}
    </div>
  </div>
</template>
