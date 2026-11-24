<template>
  <a-auto-complete
    v-model:value="inputValue"
    :options="options"
    style="width: 100%"
    :default-active-first-option="false"
    :disabled="readonly"
    @search="handleSearch"
    @select="handleSelect"
    @keyup.enter="addTags"
  >
    <a-input :placeholder="$t(placeholder)" ref="inputTagRef">
      <template #prefix>
        <template v-for="(tag, index) in tags" :key="index">
          <a-tag
            :closable="!readonly"
            :style="myColors[index] || {}"
            @close.prevent="handleClose(index)"
          >
            {{ tag }}
          </a-tag>
        </template>
      </template>
    </a-input>
  </a-auto-complete>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref, nextTick } from 'vue';
  import { createNamespace } from '../utils/components';
  import { isNullOrEmpty } from '../utils/is';

  defineOptions({ name: createNamespace('inputTag').name });
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
     * @defaultValue '请输入标签，回车完成标签填写'
     */
    placeholder: {
      type: String,
      default: '请输入标签，回车完成标签填写',
    },
    /**
     * @zh 是否禁用。
     */
    readonly: Boolean,
    /**
     * @zh 颜色组
     * @defaultValue []
     */
    colors: {
      type: Array,
      default: () => [],
    },
    /**
     * @zh 样式是否循环
     * @defaultValue true
     */
    isStyleLoop: {
      type: Boolean,
      default: true,
    },
  });
  const emit = defineEmits({
    'update:value': (val: string) => true,
    /**
     * @zh 数据值改变的时候调用
     * @param data
     */
    change: (data: { value: string }) => true,
    /**
     * @zh 被选中时调用，参数为选中项的 value 值
     */
    select: (value: any) => true,
    /**
     * @zh 搜索补全项的时候调用
     */
    search: (value: any) => true,
  });

  const inputTagRef = ref();
  const inputValue = ref();
  const tags = computed(() => (isNullOrEmpty(props.value) ? [] : props.value?.split(',') || []));

  const myColors = computed(() => {
    if (props.isStyleLoop) {
      return (
        tags.value?.map((item, index) => {
          let styleItem: Record<string, any> = props.colors[index % props.colors.length] || {};
          styleItem = { ...styleItem, borderWidth: (styleItem.borderWidth || 0) + 'px' };
          return styleItem;
        }) || []
      );
    }
    return props.colors;
  });
  const handleSelect = (value: any) => {
    addTags();
    emit('select', value);
  };
  const handleSearch = (value: any) => {
    emit('search', value);
  };
  const addTags = () => {
    if (inputValue.value) {
      tags.value.push(inputValue.value);
      inputValue.value = '';
      emit('update:value', tags.value.join(','));
      emit('change', { value: tags.value.join(',') });
      nextTick(() => {
        inputTagRef.value?.focus();
      });
    }
  };
  const handleClose = (index: number) => {
    tags.value.splice(index, 1);
    emit('update:value', tags.value.join(','));
    emit('change', { value: tags.value.join(',') });
  };
</script>

<style lang="less">
  @import './inputTag';
</style>
