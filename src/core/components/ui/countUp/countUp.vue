<template>
  <span ref="el"></span>
</template>

<script lang="ts" setup>
  import { CountUp } from 'countup.js';
  import { computed, watch, ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('countUp').name });

  const props = defineProps({
    /**
     * @zh 是否有动画渲染
     * @defaultValue true
     */
    animation: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 开始显示值
     * @defaultValue 0
     */
    startValue: {
      type: Number,
      required: false,
      default: 0,
    },
    /**
     * @zh 最终显示值,必填
     * @defaultValue -
     */
    endValue: {
      type: [String, Number],
      required: true,
    },
    /**
     * @zh 小数点
     * @defaultValue 0
     */
    decimals: {
      type: Number,
      required: false,
      default: 0,
    },
    /**
     * @zh 动画时间，秒
     * @defaultValue 2
     */
    duration: {
      type: Number,
      required: false,
      default: 2,
    },
    /**
     * @zh 配置参数，参考countup.js
     * @defaultValue - true
     */
    options: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    /**
     * @zh 动画结束回调方法
     * @defaultValue false
     */
    callback: {
      type: Function,
      required: false,
      default: () => {},
    },
  });

  const el = ref();
  const c = ref<any>(null);
  const options = computed(() => props.options);
  onMounted(() => {
    if (props.animation) {
      init();
    }
  });
  watch(
    () => props.decimals,
    () => {
      if (c.value && c.value.update) {
        c.value.options.decimalPlaces = props.decimals;
        c.value.reset();
        c.value.update(props.endValue);
      }
    },
    { deep: true },
  );
  watch(
    () => props.endValue,
    (value) => {
      if (c.value && c.value.update) {
        c.value.update(value);
      }
    },
  );
  const init = () => {
    if (!c.value) {
      options.value.startVal = props.startValue;
      options.value.decimalPlaces = props.decimals;
      options.value.duration = props.duration;
      c.value = new CountUp(el.value, Number(props.endValue), options.value);
      c.value.start(() => {
        props.callback(c.value);
      });
    }
  };
  onUnmounted(() => {
    c.value = null;
  });
  onBeforeUnmount(() => {
    c.value = null;
  });
</script>

<style lang="less">
  @import './countUp';
</style>
