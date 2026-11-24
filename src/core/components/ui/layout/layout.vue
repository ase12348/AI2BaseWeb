<template>
  <div ref="layout" :class="['lr-layout', { 'lr-layout-not-hidden': notHidden }]">
    <div class="lr-layout--left" v-if="hasLeft" :style="{ width: leftWidth }">
      <div class="lr-block"><slot name="left"></slot></div>
      <div v-if="leftMove" class="lr-layout--move" @mousedown="onMousedown('left', $event)"></div>
    </div>
    <div class="lr-layout--container" v-if="!shouldHideMid">
      <div class="lr-layout--top" v-if="hasTop" :style="{ height: topHight }">
        <div class="lr-block"><slot name="top"></slot></div>
        <div v-if="topMove" class="lr-layout--move" @mousedown="onMousedown('top', $event)"></div>
      </div>
      <div class="lr-layout--wrapper" ref="mid" :style="midStyle">
        <slot></slot>
      </div>
      <div class="lr-layout--bottom" v-if="hasBottom" :style="{ height: bottomHight }">
        <div class="lr-block"><slot name="bottom"></slot></div>
        <div
          v-if="bottomMove"
          class="lr-layout--move"
          @mousedown="onMousedown('bottom', $event)"
        ></div>
      </div>
    </div>
    <div class="lr-layout--right" v-if="hasRight" :style="{ width: rightWidth }">
      <div class="lr-block"><slot name="right"></slot></div>
      <div v-if="rightMove" class="lr-layout--move" @mousedown="onMousedown('right', $event)"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, onMounted, onUnmounted, useSlots } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('layout').name });

  const props = defineProps({
    /**
     * @zh 左侧宽度
     * @defaultValue 240
     */
    left: {
      type: [Number, String],
      default: 240,
    },
    /**
     * @zh 右侧宽度
     * @defaultValue 240
     */
    right: {
      type: [Number, String],
      default: 240,
    },
    /**
     * @zh 上侧高度
     * @defaultValue 60
     */
    top: {
      type: [Number, String],
      default: 60,
    },
    /**
     * @zh 下侧高度
     * @defaultValue 60
     */
    bottom: {
      type: [Number, String],
      default: 60,
    },
    /**
     * @zh 允许左侧变动大小
     * @defaultValue true
     */
    leftMove: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 允许右侧变动大小
     * @defaultValue true
     */
    rightMove: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 允许上侧变动大小
     * @defaultValue true
     */
    topMove: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 允许下侧变动大小
     */
    bottomMove: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 超出部分是否不隐藏
     */
    notHidden: Boolean,

    /**
     * @zh mid区域最小宽度
     * @defaultValue 0
     */
    midMinWidth: {
      type: Number,
      default: 0,
    },
    /**
     * @zh mid区域最小高度
     * @defaultValue 0
     */
    midMinHeight: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 当整体宽度小于mid最小宽度时隐藏中间区域
     * @defaultValue false
     */
    hideMidWhenNarrow: {
      type: Boolean,
      default: false,
    },
  });

  /**
   * @zh 左侧
   * @slot left
   */
  /**
   * @zh 右侧
   * @slot right
   */
  /**
   * @zh 下边
   * @slot bottom
   */
  /**
   * @zh 上边
   * @slot top
   */
  /**
   * @zh 中间
   * @slot defualt
   */
  const slots = useSlots();

  const layout = ref();
  const mid = ref();
  const containerWidth = ref(0);
  const shouldHideMid = ref(false);
  const _mleft = ref<number | string>(-1);
  const _mright = ref<number | string>(-1);
  const _mtop = ref<number | string>(-1);
  const _mbottom = ref<number | string>(-1);
  const move = reactive({
    type: '',
    isMove: false,
    pageX: 0,
    pageY: 0,
    size: 0 as number | string,
    h: 0,
    w: 0,
  });

  const mleft = computed({
    get() {
      if (_mleft.value !== -1) {
        return _mleft.value;
      }
      return props.left;
    },
    set(val) {
      _mleft.value = val;
    },
  });
  const mright = computed({
    get() {
      if (_mright.value !== -1) {
        return _mright.value;
      }
      return props.right;
    },
    set(val) {
      _mright.value = val;
    },
  });
  const mtop = computed({
    get() {
      if (_mtop.value !== -1) {
        return _mtop.value;
      }
      return props.top;
    },
    set(val) {
      _mtop.value = val;
    },
  });
  const mbottom = computed({
    get() {
      if (_mbottom.value !== -1) {
        return _mbottom.value;
      }
      return props.bottom;
    },
    set(val) {
      _mbottom.value = val;
    },
  });

  const hasLeft = computed(() => slots.left);
  const hasRight = computed(() => slots.right);
  const hasTop = computed(() => slots.top);
  const hasBottom = computed(() => slots.bottom);

  const leftWidth = computed(() => {
    if (hasLeft.value) {
      // 当mid隐藏时，left和right平分剩余宽度
      if (shouldHideMid.value && props.hideMidWhenNarrow && hasRight.value) {
        return '50%';
      }
      if (shouldHideMid.value && props.hideMidWhenNarrow && !hasRight.value) {
        return '100%';
      }
      return typeof mleft.value === 'number' ? mleft.value + 'px' : mleft.value;
    }
    return '0';
  });
  const rightWidth = computed(() => {
    if (hasRight.value) {
      // 当mid隐藏时，left和right平分剩余宽度
      if (shouldHideMid.value && props.hideMidWhenNarrow && hasLeft.value) {
        return '50%';
      }
      if (shouldHideMid.value && props.hideMidWhenNarrow && !hasLeft.value) {
        return '100%';
      }
      return typeof mright.value === 'number' ? mright.value + 'px' : mright.value;
    }
    return '0';
  });
  const topHight = computed(() => {
    if (hasTop.value) {
      return typeof mtop.value === 'number' ? mtop.value + 'px' : mtop.value;
    }
    return '0';
  });
  const bottomHight = computed(() => {
    if (hasBottom.value) {
      return typeof mbottom.value === 'number' ? mbottom.value + 'px' : mbottom.value;
    }
    return '0';
  });

  const midStyle = computed(() => ({
    minWidth: props.midMinWidth + 'px',
    minHeight: props.midMinHeight + 'px',
  }));

  const onMousedown = (type: string, e: MouseEvent) => {
    move.type = type;
    move.isMove = true;
    move.pageX = e.pageX;
    move.pageY = e.pageY;
    move.h = mid.value.clientHeight;
    move.w = mid.value.clientWidth;

    const containerWidth = layout.value.clientWidth;
    const containerHeight = layout.value.clientHeight;

    switch (type) {
      case 'left': {
        const { value } = mleft;
        move.size =
          typeof value === 'string' && (value as string).includes('%')
            ? (parseFloat(value as string) / 100) * containerWidth
            : Number(value);
        break;
      }
      case 'right': {
        const { value } = mright;
        move.size =
          typeof value === 'string' && (value as string).includes('%')
            ? (parseFloat(value as string) / 100) * containerWidth
            : Number(value);
        break;
      }
      case 'top': {
        const { value } = mtop;
        move.size =
          typeof value === 'string' && (value as string).includes('%')
            ? (parseFloat(value as string) / 100) * containerHeight
            : Number(value);
        break;
      }
      case 'bottom': {
        const { value } = mbottom;
        move.size =
          typeof value === 'string' && (value as string).includes('%')
            ? (parseFloat(value as string) / 100) * containerHeight
            : Number(value);
        break;
      }
    }
    document.onmouseup = onMouseup;
    document.onmousemove = onMousemove;
  };
  const onMousemove = (e: MouseEvent) => {
    if (move.isMove) {
      switch (move.type) {
        case 'left': {
          const x1 = e.pageX - move.pageX;
          let left = (move.size as number) + x1;
          if (left < 0) {
            left = 4;
          } else if (left > (move.size as number) + move.w - props.midMinWidth) {
            left = (move.size as number) + move.w - props.midMinWidth;
          }
          mleft.value = left;
          break;
        }

        case 'right': {
          const x2 = e.pageX - move.pageX;
          let right = (move.size as number) - x2;
          if (right < 0) {
            right = 4;
          } else if (right > (move.size as number) + move.w - props.midMinWidth) {
            right = (move.size as number) + move.w - props.midMinWidth;
          }
          mright.value = right;
          break;
        }

        case 'top': {
          const y = e.pageY - move.pageY;
          let top = (move.size as number) + y;
          if (top < 0) {
            top = 4;
          } else if (top > (move.size as number) + move.h - props.midMinHeight) {
            top = (move.size as number) + move.h - props.midMinHeight;
          }
          mtop.value = top;
          break;
        }
        case 'bottom': {
          const y2 = e.pageY - move.pageY;
          let bottom = (move.size as number) - y2;
          if (bottom < 0) {
            bottom = 4;
          } else if (bottom > (move.size as number) + move.h - props.midMinHeight) {
            bottom = (move.size as number) + move.h - props.midMinHeight;
          }
          mbottom.value = bottom;
          break;
        }
      }
    }
  };
  const onMouseup = () => {
    move.isMove = false;
    document.onmouseup = null;
    document.onmousemove = null;
  };

  const checkShouldHideMid = () => {
    if (!props.hideMidWhenNarrow || !layout.value) {
      shouldHideMid.value = false;
      return;
    }

    containerWidth.value = layout.value.clientWidth;

    // 计算left和right的实际宽度
    let leftWidth = 0;
    let rightWidth = 0;

    if (hasLeft.value) {
      const { value } = mleft;
      leftWidth =
        typeof value === 'string' && value.includes('%')
          ? (parseFloat(value) / 100) * containerWidth.value
          : Number(value);
    }

    if (hasRight.value) {
      const { value } = mright;
      rightWidth =
        typeof value === 'string' && value.includes('%')
          ? (parseFloat(value) / 100) * containerWidth.value
          : Number(value);
    }

    // 计算剩余可用宽度
    const availableWidth = containerWidth.value - leftWidth - rightWidth;

    // 如果可用宽度小于midMinWidth，则隐藏mid区域
    shouldHideMid.value = availableWidth < props.midMinWidth;
  };

  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    if (
      props.hideMidWhenNarrow &&
      layout.value &&
      typeof window !== 'undefined' &&
      window.ResizeObserver
    ) {
      // 初始检查
      checkShouldHideMid();

      // 监听容器尺寸变化
      resizeObserver = new ResizeObserver(() => {
        checkShouldHideMid();
      });
      resizeObserver.observe(layout.value);
    }
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });
</script>

<style lang="less">
  @import './layout';
</style>
