<template>
  <div :class="['lr-slider']">
    <a-slider
      v-model:value="currentValue"
      :autofocus="autofocus"
      :dots="dots"
      :included="included"
      :disabled="disabled"
      :max="max"
      :min="min"
      :range="range"
      :reverse="reverse"
      :step="step"
      :marks="marksValue"
      :get-tooltip-popup-container="getTooltipPopupContainer"
      :tip-formatter="TipFormatter"
      :tooltip-placement="tooltipPlacement"
    />
    <a-input-number
      v-if="showInput"
      v-model:value="currentValue"
      :min="min"
      :max="max"
      :step="step"
      :controls="false"
      :size="size"
      :disabled="disabled"
      style="width: 100%"
    />
  </div>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref, VNode } from 'vue';

  defineOptions({ name: 'LrSlider' });

  const props = defineProps({
    /**
     * @zh 设置当前取值。当 range 为 false 时，使用 number，否则用 [number, number]
     */
    value: {
      type: [Number, Array] as PropType<number | number[]>,
    },
    /**
     * @zh 自动获取焦点
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 值为 true 时，滑块为禁用状态
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否只能拖拽到刻度上
     */
    dots: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh marks 不为空对象时有效，值为 true 时表示值为包含关系，false 表示并列
     */
    included: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 刻度标记，key 的类型必须为 number 且取值在闭区间 [min, max] 内，每个标签可以单独设置样式
     */
    marks: {
      type: Object as PropType<
        { number: string | VNode } | { number: { style: object; label: string | VNode } }
      >,
    },
    /**
     * @zh 最大值
     */
    max: {
      type: Number,
      default: 100,
    },
    /**
     * @zh 最小值
     */
    min: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 双滑块模式
     */
    range: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 反向坐标轴
     */
    reverse: {
      type: Boolean,
    },
    /**
     * @zh 步长，取值必须大于 0，并且可被 (max - min) 整除。当 marks 不为空对象时，可以设置 step 为 null，此时 Slider 的可选值仅有 marks 标出来的部分。
     */
    step: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 值为 true 时，Slider 为垂直方向
     */
    vertical: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示输入框
     */
    showInput: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 输入框尺寸
     */
    size: {
      type: String as PropType<'small' | 'large' | 'middle'>,
    },
    /**
     * @zh 是否显示间断点
     */
    showStops: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示tooltip
     */
    showTooltip: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh Slider 会把当前值传给 tipFormatter，并在 Tooltip 中显示 tipFormatter 的返回值，若为 null，则隐藏 Tooltip。
     */
    tipFormatter: Function,
    /**
     * @zh 设置 Tooltip 展示位置。参考 Tooltip
     * @defaultValue 'top'
     */
    tooltipPlacement: {
      type: String as PropType<
        | 'top'
        | 'left'
        | 'right'
        | 'bottom'
        | 'topLeft'
        | 'topRight'
        | 'bottomLeft'
        | 'bottomRight'
        | 'leftTop'
        | 'leftBottom'
        | 'rightTop'
        | 'rightBottom'
      >,
      default: 'top',
    },
    /**
     * @zh Tooltip 渲染父节点，默认渲染到 body 上。
     */
    getTooltipPopupContainer: Function,
  });

  const emit = defineEmits({
    'update:value': (value: number) => true,
    /**
     * @zh 当 Slider 的值发生改变时触发
     */
    change: (data: { value: number }) => true,
  });
  const value2 = ref<any>('jcode_no_prop');
  const currentValue = computed({
    get() {
      if (value2.value !== 'jcode_no_prop') {
        return value2.value;
      }
      return props.value;
    },
    set(val) {
      value2.value = val;
      emit('update:value', val);
      emit('change', { value: val });
    },
  });

  const marksValue = computed(() => {
    if (props.showStops && props.marks === undefined && props.step) {
      const obj: Record<number, any> = {};
      for (let i = 0; i < props.max; ) {
        obj[i] = '';
        i += props.step;
      }
      return obj;
    }
    return props.marks || {};
  });

  const handleTipFormatter = (value: number) => {
    if (props.tipFormatter) {
      return props.tipFormatter;
    }
    return value;
  };
  const TipFormatter = computed(() => {
    if (props.showTooltip) {
      return handleTipFormatter;
    }
    return null;
  });
</script>

<style lang="less">
  @import './slider.less';
</style>
