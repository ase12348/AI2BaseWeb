<template>
  <div
    ref="wrapperRef"
    class="lr-slider-captcha slider-border"
    :class="props.class"
    :style="wrapperStyle"
    @mouseleave="handleDragOver"
    @mousemove="handleDragMoving"
    @mouseup="handleDragOver"
    @touchend="handleDragOver"
    @touchmove="handleDragMoving"
  >
    <SliderCaptchaBar ref="barRef" :bar-style="barStyle" :to-left="state.toLeft" />
    <SliderCaptchaContent
      ref="contentRef"
      :content-style="contentStyle"
      :is-passing="state.isPassing"
      :text="text"
      :success-text="successText"
    />

    <SliderCaptchaAction
      ref="actionRef"
      :action-style="actionStyle"
      :is-passing="state.isPassing"
      :to-left="state.toLeft"
      @mousedown="handleDragStart"
      @touchstart="handleDragStart"
    />
  </div>
</template>
<script setup lang="ts">
  import { PropType, reactive, unref, useTemplateRef, watch, watchEffect } from 'vue';

  import SliderCaptchaAction from './sliderCaptchaAction.vue';
  import SliderCaptchaBar from './sliderCaptchaBar.vue';
  import SliderCaptchaContent from './sliderCaptchaContent.vue';

  defineOptions({
    name: 'LrSliderCaptcha',
  });

  const props = defineProps({
    /**
     * @zh 自定义类名
     */
    class: {
      type: [String, Object, Array] as PropType<any>,
    },
    /**
     * @zh 验证状态
     * @vModel
     */
    value: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    /**
     * @zh 滑块的样式
     */
    actionStyle: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    /**
     * @zh 滑块条的样式
     */
    barStyle: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    /**
     * @zh 内容的样式
     */
    contentStyle: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    /**
     * @zh 组件的样式
     */
    wrapperStyle: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    /**
     * @zh 验证成功的提示
     * @defaultValue '验证成功'
     */
    successText: {
      type: String,
      default: '验证成功',
    },
    /**
     * @zh 提示文字
     * @defaultValue '请按住滑块拖动'
     */
    text: {
      type: String,
      default: '请按住滑块拖动',
    },
  });

  const emit = defineEmits<{
    change: [{ value: boolean | undefined }];
    end: [MouseEvent | TouchEvent];
    move: [{ event: MouseEvent | TouchEvent; moveDistance: number; moveX: number }];
    start: [MouseEvent | TouchEvent];
    success: [{ isPassing: boolean; time: number | string }];
    'update:value': [value: boolean | undefined];
  }>();

  const state = reactive({
    endTime: 0,
    isMoving: false,
    isPassing: false,
    moveDistance: 0,
    startTime: 0,
    toLeft: false,
  });

  const wrapperRef = useTemplateRef<HTMLDivElement>('wrapperRef');
  const barRef = useTemplateRef<typeof SliderCaptchaBar>('barRef');
  const contentRef = useTemplateRef<typeof SliderCaptchaContent>('contentRef');
  const actionRef = useTemplateRef<typeof SliderCaptchaAction>('actionRef');

  watch(
    () => state.isPassing,
    (isPassing) => {
      if (isPassing) {
        const { endTime, startTime } = state;
        const time = (endTime - startTime) / 1000;
        emit('success', { isPassing, time: time.toFixed(1) });
      }
      const value = isPassing ? true : undefined;
      emit('update:value', value);
      emit('change', { value });
    },
  );

  watchEffect(() => {
    state.isPassing = !!props.value;
  });

  function getEventPageX(e: MouseEvent | TouchEvent): number {
    if ('pageX' in e) {
      return e.pageX;
    }
    if ('touches' in e && e.touches[0]) {
      return e.touches[0].pageX;
    }
    return 0;
  }

  function handleDragStart(e: MouseEvent | TouchEvent) {
    if (state.isPassing) {
      return;
    }
    if (!actionRef.value) return;
    emit('start', e);

    state.moveDistance =
      getEventPageX(e) -
      Number.parseInt(actionRef.value.getStyle().left.replace('px', '') || '0', 10);
    state.startTime = Date.now();
    state.isMoving = true;
  }

  function getOffset(actionEl: HTMLDivElement) {
    const wrapperWidth = wrapperRef.value?.offsetWidth ?? 220;
    const actionWidth = actionEl?.offsetWidth ?? 40;
    const offset = wrapperWidth - actionWidth - 6;
    return { actionWidth, offset, wrapperWidth };
  }

  function handleDragMoving(e: MouseEvent | TouchEvent) {
    const { isMoving, moveDistance } = state;
    if (isMoving) {
      const actionEl = unref(actionRef);
      const barEl = unref(barRef);
      if (!actionEl || !barEl) return;
      const { actionWidth, offset, wrapperWidth } = getOffset(actionEl.getEl());
      const moveX = getEventPageX(e) - moveDistance;

      emit('move', {
        event: e,
        moveDistance,
        moveX,
      });
      if (moveX > 0 && moveX <= offset) {
        actionEl.setLeft(`${moveX}px`);
        barEl.setWidth(`${moveX + actionWidth / 2}px`);
      } else if (moveX > offset) {
        actionEl.setLeft(`${wrapperWidth - actionWidth}px`);
        barEl.setWidth(`${wrapperWidth - actionWidth / 2}px`);
        checkPass();
      }
    }
  }

  function handleDragOver(e: MouseEvent | TouchEvent) {
    const { isMoving, isPassing, moveDistance } = state;
    if (isMoving && !isPassing) {
      emit('end', e);
      const actionEl = actionRef.value;
      const barEl = unref(barRef);
      if (!actionEl || !barEl) return;
      const moveX = getEventPageX(e) - moveDistance;
      const { actionWidth, offset, wrapperWidth } = getOffset(actionEl.getEl());
      if (moveX < offset) {
        resume();
      } else {
        actionEl.setLeft(`${wrapperWidth - actionWidth}px`);
        barEl.setWidth(`${wrapperWidth - actionWidth / 2}px`);
        checkPass();
      }
      state.isMoving = false;
    }
  }

  function checkPass() {
    state.endTime = Date.now();
    state.isPassing = true;
    state.isMoving = false;
  }

  function resume() {
    state.isMoving = false;
    state.isPassing = false;
    state.moveDistance = 0;
    state.toLeft = false;
    state.startTime = 0;
    state.endTime = 0;
    const actionEl = unref(actionRef);
    const barEl = unref(barRef);
    const contentEl = unref(contentRef);
    if (!actionEl || !barEl || !contentEl) return;

    contentEl.getEl().style.width = '100%';
    state.toLeft = true;
    setTimeout(() => {
      state.toLeft = false;
      actionEl.setLeft('0');
      barEl.setWidth('0');
    }, 300);
  }
</script>

<style lang="less">
  @import './sliderCaptcha';
</style>
