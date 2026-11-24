<template>
  <a-input readonly :size="size" v-model:value="myValue" />
</template>

<script lang="ts" setup>
  import { PropType, watch, ref } from 'vue';
  import { buildUUID } from '../utils/method';

  defineOptions({ name: 'LrGuid' });

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
     * @zh 选框尺寸
     */
    size: {
      type: String as PropType<'small' | 'large' | 'middle'>,
    },
  });

  const emit = defineEmits({
    'update:value': (val: string | undefined) => true,
  });
  const myValue = ref('');
  watch(
    () => props.value,
    (val) => {
      if (!val) {
        myValue.value = buildUUID();
        emit('update:value', myValue.value);
      } else {
        myValue.value = val;
      }
    },
    { immediate: true },
  );
</script>

<style lang="less">
  @import './guid';
</style>
