<template>
  <div class="l-barpercent" :style="{ 'padding-top': title ? '64px' : '' }">
    <div class="l-barpercent-title" v-if="title">{{ title }}</div>
    <div class="l-barpercent-list">
      <div v-for="(item, index) in data" :key="index" class="l-barpercent-item">
        <div class="label" :style="labelStyle">{{ item[labelKey] }}</div>
        <div class="percent-bar" :style="itemStyle" @click="handleClick(item, index)">
          <div
            class="active"
            :style="{
              height: myColor[index % data.length]?.c1,
              width: `${
                Number((item[valueKey] / item[maxValueKey]) * 100) > 100
                  ? 100
                  : Number((item[valueKey] / item[maxValueKey]) * 100)
              }%`,
              background: `linear-gradient(270deg, ${
                myColor[index]?.c1 || myColor[index % myColor.length]?.c1 || 'var(--color-primary)'
              } 0%, ${
                myColor[index]?.c2 ||
                myColor[index % myColor.length]?.c2 ||
                'var(--color-primary-active)'
              } 100%)`,
              borderTopRightRadius: `${borderRadius || 0}px`,
              borderBottomRightRadius: `${borderRadius || 0}px`,
            }"
          ></div>
          <div class="num" :style="numStyle">{{ item[valueKey] }}/{{ item[maxValueKey] }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, computed } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('barpercent').name });

  const props = defineProps({
    /**
     * @zh 数据
     */
    data: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 标题
     */
    title: String,
    /**
     * @zh 值字段
     */
    valueKey: {
      type: String,
      default: 'value',
    },
    /**
     * @zh 最大值字段
     */
    maxValueKey: {
      type: String,
      default: 'value1',
    },
    /**
     * @zh 标题字段
     */
    labelKey: {
      type: String,
      default: 'label',
    },
    /**
     * @zh 颜色组
     */
    colors: {
      type: Array,
      default: () => [],
    },
    /**
     * @zh 柱状条宽度
     */
    barW: {
      type: Number,
      default: 24,
    },
    backgroundColor: String,
    borderW: Number,
    borderColor: String,
    borderRadius: Number,
    labelColor: String,
    labelSize: Number,
    numColor: String,
    numSize: Number,
  });

  const emit = defineEmits({
    /**
     * @zh 点击按钮时触发
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    click: (_: Record<string, any>) => true,
  });

  const myColor = computed(() => {
    const colors: any[] = [];
    props.colors
      .filter((t: any) => t.c1 || t.c2)
      .forEach((item: any) => {
        colors.push({
          c1: item.c1 || item.c2,
          c2: item.c2 || item.c1,
        });
      });
    return colors;
  });
  const itemStyle = computed(() => ({
    height: `${props.barW}px`,
    borderTopRightRadius: `${props.borderRadius || 0}px`,
    borderBottomRightRadius: `${props.borderRadius || 0}px`,
    border: props.borderW
      ? props.borderW + 'px solid ' + props.borderColor || props.backgroundColor
      : 'none',
    backgroundColor: props.backgroundColor || 'var(--color-primary-border-hover)',
  }));
  const labelStyle = computed(() => ({
    color: props.labelColor || 'var(--color-text)',
    fontSize: `${props.labelSize || 12}px`,
  }));
  const numStyle = computed(() => ({
    color: props.numColor || '#fff',
    fontSize: `${props.numSize || 12}px`,
  }));

  const handleClick = (data: any, index: number) => {
    emit('click', { data, index });
  };
</script>

<style lang="less">
  @import './barpercent';
</style>
