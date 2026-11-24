<template>
  <a-cascader
    v-model:value="myValue"
    :options="options"
    :placeholder="$t(placeholder)"
    :disabled="readonly"
    :change-on-select="changeOnSelect == 'any' ? true : false"
    :expand-trigger="expandTrigger"
    :allow-clear="allowClear"
    :max-tag-count="maxTagCount"
    :load-data="loadData"
    :show-search="showSearch"
    @change="handleChange"
  >
    <template #displayRender="{ labels }">
      <span v-if="showFormat == 'mostChild'">
        {{ labels[labels.length - 1] }}
      </span>
      <template v-else>
        <span v-for="(label, index) in labels" :key="index">
          <span v-if="index === labels.length - 1">
            {{ label }}
          </span>
          <span v-else>{{ label }} {{ separator }}</span>
        </span>
      </template>
    </template>
  </a-cascader>
</template>
<script lang="ts" setup>
  import { PropType, computed } from 'vue';
  import { createNamespace } from '../utils/components';
  import { isNullOrEmpty } from '../utils/is';

  defineOptions({ name: createNamespace('cascaderSelect').name });

  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: [String] as PropType<string>,
      default: undefined,
    },
    /**
     * @zh 自动完成的数据源
     * @defaultValue []
     */
    options: {
      type: Array,
      default: () => [],
    },
    /**
     * @zh 输入框提示
     * @defaultValue '请选择'
     */
    placeholder: {
      type: String,
      default: '请选择',
    },
    /**
     * @zh 是否禁用。
     */
    readonly: Boolean,
    /**
     * @zh 分隔符
     * @defaultValue '/'
     */
    separator: {
      type: String,
      default: '/',
    },
    /**
     * @zh 显示格式(显示全部结果或只显示最子级)
     * @defaultValue 'all'
     */
    showFormat: {
      type: String as PropType<'all' | 'mostChild'>,
      default: 'all',
    },
    /**
     * @zh 当此项为 any 时，点选每级菜单选项值都会发生变化
     * @defaultValue mostChild
     */
    changeOnSelect: {
      type: String as PropType<'any' | 'mostChild'>,
      default: 'mostChild',
    },
    /**
     * @zh 次级菜单的展开方式
     * @defaultValue 'click'
     */
    expandTrigger: {
      type: String as PropType<'click' | 'hover'>,
      default: 'click',
    },
    /**
     * @zh 是否支持清除
     * @defaultValue true
     */
    allowClear: {
      type: Boolean,
      default: true,
    },
    maxTagCount: Number,
    loadData: Function,
    showSearch: Object,
  });

  const emit = defineEmits({
    'update:value': (val: string) => true,
    /**
     * @zh 数据值改变的时候调用
     * @param data
     */
    change: (data: { value: string; data: any }) => true,
  });

  const myValue = computed({
    get() {
      return isNullOrEmpty(props.value) ? [] : props.value?.split(',') || [];
    },
    set(newValue) {
      emit('update:value', isNullOrEmpty(newValue) ? '' : newValue.join(','));
    },
  });
  const handleChange = (value: any[], selectedOptions: any) => {
    emit('change', {
      value: isNullOrEmpty(value) ? '' : value.join(','),
      data: selectedOptions,
    });
  };
</script>

<style lang="less">
  @import './cascaderSelect';
</style>
