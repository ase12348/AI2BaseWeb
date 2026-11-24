<template>
  <a-select
    :placeholder="$t(placeholder)"
    :readonly="readonly"
    :size="size"
    :clearable="readonly ? false : clearable"
    v-model:value="value"
    @change="handleChange"
  >
    <a-select-opt-group v-for="group in myDblinkTree" :key="group.id" :label="group.label">
      <a-select-option v-for="item in group.children" :key="item.id" :value="item.id">{{
        item.label
      }}</a-select-option>
    </a-select-opt-group>
  </a-select>
</template>
<script lang="ts" setup>
  import { computed, onMounted } from 'vue';
  import { useDblink } from '/@/core/hooks/data/useDblink';

  const props = defineProps({
    /**
     * 输入值
     */
    modelValue: {
      type: String,
      default: undefined,
    },
    /**
     * 占位符
     */
    placeholder: {
      type: String,
      default: '请选择数据库',
    },
    /**
     * @zh 选框尺寸
     */
    size: {
      type: String as PropType<'small' | 'large' | 'middle'>,
    },
    /**
     * @zh 是否可以操作
     */
    readonly: {
      type: Boolean,
      defauly: false,
    },
    /**
     * @zh 是否可以清除
     */
    clearable: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否不包含lrsystemdb
     */
    isNoSystem: {
      type: Boolean,
      default: false,
    },
  });

  const { getDblinkTree, getDblinkTreeNoSystem, loadDblinkList } = useDblink();

  onMounted(async () => {
    await loadDblinkList();
  });

  const emit = defineEmits(['update:modelValue', 'change']);

  const myDblinkTree = computed(() => {
    if (props.isNoSystem) {
      return getDblinkTreeNoSystem.value;
    }
    return getDblinkTree.value;
  });
  const handleChange = (val, option) => {
    if (!val) {
      emit('change', { value: undefined });
    } else {
      emit('change', { value: val, data: option });
    }
  };

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });
</script>
