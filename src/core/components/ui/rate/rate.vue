<template>
  <div>
    <a-rate
      v-model:value="currentValue"
      :count="count"
      :allow-half="allowHalf"
      :allow-clear="allowClear"
      :disabled="disabled"
      @hover-change="hoverChange"
    />
    <span class="ant-rate-text" v-if="showScore">{{ score }}</span>
    <span class="ant-rate-text" v-else-if="showText">{{ text }}</span>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref } from 'vue';
  import { createNamespace } from '../utils/components';
  import { isNullOrEmpty } from '../utils/is';

  defineOptions({ name: createNamespace('rate').name });

  const props = defineProps({
    /**
     * @zh star 总数
     * @defaultValue 5
     */
    count: {
      type: Number,
      default: 5,
    },
    /**
     * @zh 当前数
     * @defaultValue 0
     */
    value: {
      type: [Number, String] as PropType<number | string>,
      default: 0,
    },
    /**
     * @zh 是否允许再次点击后清除
     * @defaultValue false
     */
    allowClear: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否允许半选
     * @defaultValue false
     */
    allowHalf: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示文字
     * @defaultValue false
     */
    showText: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示数字
     * @defaultValue false
     */
    showScore: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 辅助文字
     * @defaultValue []
     */
    texts: {
      type: Array,
      default: () => [],
    },
    /**
     * @zh 只读
     * @defaultValue false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits({
    'update:value': (value: number) => true,
    /**
     * @zh 当 Rate 的值发生改变时触发
     */
    change: (data: { value: number }) => true,
  });

  const value2 = ref<any>('jcode_no_prop');
  const currentValue = computed({
    get() {
      if (value2.value !== 'jcode_no_prop') {
        return value2.value;
      }
      return Number(props.value);
    },
    set(val) {
      value2.value = val;
      emit('update:value', val);
      emit('change', { value: val });
    },
  });
  const hoverValue = ref(0);
  const desc = computed(() => {
    let res = [];
    if (!isNullOrEmpty(props.texts)) {
      if (typeof props.texts[0] === 'string') {
        res = props.texts;
      } else {
        res = props.texts.map((t: any) => t.value);
      }
    }
    return res;
  });
  const text = computed(() => {
    if (!isNullOrEmpty(currentValue.value)) {
      const val = Math.ceil(currentValue.value);
      const hoverval = hoverValue.value ? Math.ceil(hoverValue.value) : null;
      if (hoverval && !isNullOrEmpty(hoverval)) {
        return desc.value[hoverval - 1] || '';
      }
      return desc.value[val - 1];
    }
    return '';
  });
  const score = computed(() => hoverValue.value || currentValue.value);
  const hoverChange = (value: number) => {
    hoverValue.value = value;
  };
</script>

<style lang="less">
  @import './rate';
</style>
