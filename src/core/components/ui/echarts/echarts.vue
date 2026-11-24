<template>
  <div class="lr-block" ref="echartRef"></div>
</template>

<script lang="ts" setup>
  import { PropType, ref, onMounted, onUnmounted, watch } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('echarts').name });

  const props = defineProps({
    /**
     * @zh 图表配置信息
     */
    option: {
      type: Object as PropType<Record<string, any>>,
    },
  });

  const emit = defineEmits({
    /**
     * @zh 点击触发
     * @property {any} ev
     */
    click: (ev: any) => true,
  });

  const echartRef = ref();
  let myChart: any = null;

  const updateChart = (option: any) => {
    if (myChart) {
      myChart.resize();
      option && myChart.setOption(option, true);
      myChart.off('click');
      myChart.on('click', (e: any) => {
        emit('click', e);
      });
    }
  };

  const resizeObserver = new ResizeObserver((entries) => {
    myChart && myChart.resize();
  });

  onMounted(() => {
    // 判断是否引入echart包
    // @ts-ignore
    if (!window.echarts) {
      console.error('jcode[极简搭]提醒你:缺少 echarts 引入');
      return;
    }
    // @ts-ignore
    myChart = window.echarts.init(echartRef.value);
    resizeObserver.observe(echartRef.value);
    setTimeout(() => {
      updateChart(props.option);
    }, 100);
  });

  onUnmounted(() => {
    myChart.dispose();
    myChart = null;
  });

  watch(
    () => props.option,
    (newVal) => {
      // console.log('newVal', newVal)
      updateChart(newVal);
    },
  );

  // 父组件通过模板 ref 调用（如 monitor/index.vue、bi-map/index.vue）：
  // chartRef.value.updateChart(option)
  defineExpose({ updateChart });
</script>

<style lang="less">
  @import './echarts';
</style>
