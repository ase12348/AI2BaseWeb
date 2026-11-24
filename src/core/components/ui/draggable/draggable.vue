<template>
  <div
    :class="[
      'l-draggable',
      { 'l-draggable--active': (active || overActive) && !readonly && !disabled },
      { 'l-draggable--pt': isPt && !readonly && !disabled },
      { 'l-draggable--move': moveActive },
      { 'l-draggable--click': disabled },
    ]"
    @mousedown.stop="handleMove"
    @mouseover.stop="handleOver"
    @mouseout.stop="handleOut"
    :style="styleName"
  >
    <div class="l-draggable__wrapper" ref="wrapper">
      <template v-if="(active || overActive || moveActive) && !readonly && !disabled">
        <div
          :style="{ ...styleLineName, ...styleLineTopName }"
          class="l-draggable__line l-draggable__line--left"
        ></div>
        <div
          :style="{ ...styleLineName, ...styleLineLeftName }"
          class="l-draggable__line l-draggable__line--top"
        ></div>
        <div
          v-if="!isPt"
          class="l-draggable__line l-draggable__line--label"
          :style="styleLabelName"
        >
          {{ baseLeft }},{{ baseTop }}
        </div>
        <template v-else>
          <div
            :style="{
              ...styleLineName,
              ...styleLineTopName,
              transform: 'none',
            }"
            class="l-draggable__line l-draggable__line--left"
          ></div>
          <div
            :style="{
              ...styleLineName,
              ...styleLineLeftName,
              transform: 'none',
            }"
            class="l-draggable__line l-draggable__line--top"
          ></div>
          <div
            :style="{ ...styleLineName, ...styleLineBottomName }"
            class="l-draggable__line l-draggable__line--left"
          ></div>
          <div
            :style="{ ...styleLineName, ...styleLineRightName }"
            class="l-draggable__line l-draggable__line--top"
          ></div>

          <div
            :style="{
              ...styleLineName,
              ...styleLineBottomName,
              transform: 'none',
            }"
            class="l-draggable__line l-draggable__line--left"
          ></div>
          <div
            :style="{
              ...styleLineName,
              ...styleLineRightName,
              transform: 'none',
            }"
            class="l-draggable__line l-draggable__line--top"
          ></div>
        </template>
      </template>
      <template v-if="!readonly && !disabled">
        <template v-for="(item, index) in rangeList">
          <div
            :class="['l-draggable__range', `l-draggable__range--${item.classname}`]"
            :key="index"
            v-if="active"
            :style="[styleRangeName, getRangeStyle(item.classname)]"
            @mousedown.stop="rangeMove($event, item.classname)"
          ></div>
        </template>
      </template>
      <div class="l-draggable__item" ref="item">
        <slot></slot>
      </div>
      <div class="l-draggable__mask" v-if="!disabled && mask"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { createNamespace } from '../utils/components';
  import { getPx, getFixed, toPt, toPx } from '../utils/number';

  defineOptions({ name: createNamespace('draggable').name });

  const props = defineProps({
    /**
     * @zh 序号
     * @defaultValue -
     */
    index: {
      type: [String, Number],
    },
    /**
     * @zh 是否开启遮罩
     * @defaultValue true
     */
    mask: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 缩放倍数
     * @defaultValue 1
     */
    scale: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 完全只读
     * @defaultValue false
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否允许调整solt大小
     * @defaultValue true
     */
    resize: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh disabled
     * @defaultValue false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 调整刻度大小
     * @defaultValue 1
     */
    step: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 样式层级
     * @defaultValue 1
     */
    zIndex: {
      type: [String, Number],
      default: 1,
    },
    /**
     * @zh 选中组件，背景色设置半透明
     * @defaultValue 1
     */
    isActiveBgTransparent: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 距离画布左边距离
     * @defaultValue 0
     */
    left: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 距离画布顶部距离
     * @defaultValue 0
     */
    top: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 宽度,没有设置自动获取
     * @defaultValue -
     */
    width: {
      type: Number,
    },
    /**
     * @zh 高度,没有设置自动获取
     * @defaultValue -
     */
    height: {
      type: Number,
    },
    /**
     * @zh 是否是选中状态
     * @defaultValue false
     */
    activeFlag: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 尺寸单位是否是pt
     * @defaultValue false
     */
    isPt: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits({
    /**
     * @zh 获得焦点时触发
     * @property {index,width,height,left,top}
     */
    focus: ({ index, width, height, left, top }: Record<string, any>) => true,
    /**
     * @zh 失去焦点时触发
     * @property {index,width,height,left,top}
     */
    blur: ({ index, width, height, left, top }: Record<string, any>) => true,
    /**
     * @zh 鼠标悬停时触发
     * @property {index,width,height,left,top}
     */
    over: ({ index, width, height, left, top }: Record<string, any>) => true,
    /**
     * @zh 鼠标离开时触发
     * @property {index,width,height,left,top}
     */
    out: ({ index, width, height, left, top }: Record<string, any>) => true,
  });

  onMounted(() => {
    init();
  });

  const wrapper = ref();
  const item = ref();

  const baseWidth = ref<number>(0);
  const baseHeight = ref<number>(0);
  const baseLeft = ref<number>(0);
  const baseTop = ref<number>(0);
  const children = ref<Record<string, any>>({});
  const moveActive = ref<boolean>(false);
  const overActive = ref<boolean>(false);
  const rangeActive = ref<boolean>(false);
  const active = ref<boolean>(false);
  const rangeList = ref([
    { classname: 'left' },
    { classname: 'right' },
    { classname: 'top' },
    { classname: 'bottom' },
    { classname: 'top-left' },
    { classname: 'top-right' },
    { classname: 'bottom-left' },
    { classname: 'bottom-right' },
  ]);

  const scaleVal = computed(() => props.scale);
  const styleLineName = computed(() => ({ left: getPx(scaleVal.value, '', props.isPt) }));
  const styleLineLeftName = computed(() => ({ left: getPx(-scaleVal.value, '', props.isPt) }));
  const styleLineRightName = computed(() => ({
    left: 'auto',
    right: getPx(-scaleVal.value, '', props.isPt),
  }));
  const styleLineTopName = computed(() => ({ top: getPx(-scaleVal.value, '', props.isPt) }));
  const styleLineBottomName = computed(() => ({
    top: 'auto',
    bottom: getPx(-scaleVal.value, '', props.isPt),
  }));
  const styleRangeName = computed(() => {
    const calc = 8 * scaleVal.value;
    return {
      width: getPx(calc, '', props.isPt),
      height: getPx(calc, '', props.isPt),
    };
  });
  const styleLabelName = computed(() => ({
    fontSize: getPx(16 * scaleVal.value, '', props.isPt),
  }));
  const styleName = computed(() =>
    Object.assign(
      (() => {
        if (active.value) {
          const res: Record<string, any> = {
            zIndex: 9999,
            ...styleLineName.value,
          };
          if (
            props.isActiveBgTransparent &&
            (active.value || overActive) &&
            !props.readonly &&
            !props.disabled
          ) {
            res.backgroundColor = `color-mix(in srgb, var(--color-primary-bg) 60%, transparent)`;
          }
          return res;
        }
        return { zIndex: props.zIndex };
      })(),
      {
        top: getPx(baseTop.value, '', props.isPt),
        width: getPx(baseWidth.value, '', props.isPt),
        height: getPx(baseHeight.value, '', props.isPt),
        padding: getPx(8 * scaleVal.value, '', props.isPt),
        ...styleLineName.value,
        left: getPx(baseLeft.value, '', props.isPt),
      },
    ),
  );

  watch(
    () => props.width,
    (val) => {
      baseWidth.value = getFixed(pGetPx(val)) || children.value.offsetWidth;
    },
  );
  watch(
    () => props.height,
    (val) => {
      baseHeight.value = getFixed(pGetPx(val)) || children.value.offsetHeight;
    },
    { deep: true },
  );
  watch(
    () => props.left,
    (val) => {
      baseLeft.value = getFixed(pGetPx(val));
    },
  );
  watch(
    () => props.top,
    (val) => {
      baseTop.value = getFixed(pGetPx(val));
    },
  );
  watch(baseWidth, (val) => {
    wrapper.value.style.width = getPx(val, '', props.isPt);
    if (props.resize && children.value.style) {
      children.value.style.width = getPx(val, '', props.isPt);
    }
  });
  watch(baseHeight, (val) => {
    wrapper.value.style.height = getPx(val, '', props.isPt);
    if (props.resize && children.value.style) {
      children.value.style.height = getPx(val, '', props.isPt);
    }
  });
  watch(
    () => props.activeFlag,
    (val) => {
      setActive(val);
    },
  );

  // 方法
  const setActive = (val: any) => {
    active.value = val;
  };
  const pGetPx = (value: any) => {
    if (props.isPt) {
      return toPx(value);
    }
    return value;
  };
  const init = () => {
    children.value = item.value.firstChild;
    baseWidth.value = getFixed(pGetPx(props.width)) || children.value.offsetWidth;
    baseHeight.value = getFixed(pGetPx(props.height)) || children.value.offsetHeight;
    baseLeft.value = getFixed(pGetPx(props.left));
    baseTop.value = getFixed(pGetPx(props.top));

    setActive(props.activeFlag);
  };
  const getRangeStyle = (postion: any) => {
    const calc = (8 * scaleVal.value) / 2;
    const result: Record<string, any> = {};
    const list = postion.split('-');
    list.forEach((ele: any) => {
      result[ele] = getPx(-calc, '', props.isPt);
    });
    return result;
  };
  const getPtOrPx = (value: any) => {
    if (props.isPt) {
      return toPt(value);
    }
    return value;
  };
  const handleMouseDown = () => {
    moveActive.value = true;
    emit('focus', {
      index: props.index,
      width: getPtOrPx(baseWidth.value),
      height: getPtOrPx(baseHeight.value),
      left: getPtOrPx(baseLeft.value),
      top: getPtOrPx(baseTop.value),
    });
  };
  const handleMouseUp = () => {
    moveActive.value = false;
    rangeActive.value = false;
    emit('blur', {
      index: props.index,
      width: getPtOrPx(baseWidth.value),
      height: getPtOrPx(baseHeight.value),
      left: getPtOrPx(baseLeft.value),
      top: getPtOrPx(baseTop.value),
    });
  };
  const handleClear = () => {
    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
      handleMouseUp();
    };
  };
  const rangeMove = (e: { clientX: any; clientY: any }, position: string) => {
    if (props.disabled || props.readonly) return;
    // 移动的方向
    let x: boolean;
    let y: boolean;
    // 移动的位置
    let xp: boolean;
    let yp: boolean;
    // 移动的正负
    let xc: boolean;
    let yc: boolean;
    rangeActive.value = true;
    handleMouseDown();
    let disX = e.clientX;
    let disY = e.clientY;
    document.onmousemove = (e) => {
      moveActive.value = true;
      if (position === 'right') {
        x = true;
        y = false;
      } else if (position === 'left') {
        x = true;
        xp = true;
        xc = true;
        y = false;
      } else if (position === 'top') {
        x = false;
        y = true;
        yp = true;
        yc = true;
      } else if (position === 'bottom') {
        x = false;
        y = true;
      } else if (position === 'bottom-right') {
        x = true;
        y = true;
      } else if (position === 'bottom-left') {
        x = true;
        y = true;
        xp = true;
        xc = true;
      } else if (position === 'top-right') {
        x = true;
        y = true;
        yp = true;
        yc = true;
      } else if (position === 'top-left') {
        x = true;
        y = true;
        xp = true;
        xc = true;
        yp = true;
        yc = true;
      }
      const left = e.clientX - disX;
      const top = e.clientY - disY;
      disX = e.clientX;
      disY = e.clientY;
      if (x) {
        let calc = left * props.step;
        if (xc) calc = -calc;
        if (xp) baseLeft.value = getFixed(baseLeft.value - calc);
        baseWidth.value = getFixed(baseWidth.value + calc);
      }
      if (y) {
        let calc = top * props.step;
        if (yc) calc = -calc;
        if (yp) baseTop.value = getFixed(baseTop.value - calc);
        baseHeight.value = getFixed(baseHeight.value + calc);
      }
    };
    handleClear();
  };
  const handleOut = () => {
    overActive.value = false;
    emit('out', {
      index: props.index,
      width: getPtOrPx(baseWidth.value),
      height: getPtOrPx(baseHeight.value),
      left: getPtOrPx(baseLeft.value),
      top: getPtOrPx(baseTop.value),
    });
  };
  const handleOver = () => {
    if (props.disabled || props.readonly) return;
    overActive.value = true;
    emit('over', {
      index: props.index,
      width: getPtOrPx(baseWidth.value),
      height: getPtOrPx(baseHeight.value),
      left: getPtOrPx(baseLeft.value),
      top: getPtOrPx(baseTop.value),
    });
  };
  const handleMove = (e: { clientX: any; clientY: any }) => {
    if (props.disabled || props.readonly) return;
    active.value = true;
    handleMouseDown();
    let disX = e.clientX;
    let disY = e.clientY;
    document.onmousemove = (e) => {
      const left = e.clientX - disX;
      const top = e.clientY - disY;
      disX = e.clientX;
      disY = e.clientY;
      baseLeft.value = getFixed(baseLeft.value + left * props.step);
      baseTop.value = getFixed(baseTop.value + top * props.step);
    };
    handleClear();
  };
</script>

<style lang="less">
  @import './draggable';
</style>
