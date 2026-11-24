<template>
  <lr-button
    v-bind="$attrs"
    :type="type"
    :size="size"
    :label="btnLabel"
    @click="handleOpen"
    icon-name="ant-design:form-outlined"
  />
  <a-form-item-rest>
    <lr-modal
      v-model:visible="formVisible"
      :title="$t(layerLabel || '设置')"
      :height="layerHeight || 400"
      :width="layerWidth || 600"
      :has-btns="false"
    >
      <div class="lr-block" style="padding: 16px; overflow-y: auto">
        <slot></slot>
      </div>
    </lr-modal>
  </a-form-item-rest>
</template>

<script lang="ts" setup>
  import { PropType, ref } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('layerLayout').name });

  defineProps({
    /**
     * @zh 按钮的文本
     */
    btnLabel: {
      type: String,
    },
    /**
     * @zh 按钮的类型，分为五种：主要按钮、幽灵按钮、虚框按钮、链接按钮、文字按钮、次要按钮。
     * @defaultValue 'default'
     */
    type: {
      type: String as PropType<'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default'>,
      default: 'default',
    },
    /**
     * @zh 设置按钮大小
     * @defaultValue 'middle'
     */
    size: {
      type: String as PropType<'large' | 'middle' | 'small'>,
    },
    /**
     * @zh 弹窗标题
     */
    layerLabel: String,
    /**
     * @zh 弹窗高度
     */
    layerHeight: Number,
    /**
     * @zh 弹窗宽度
     */
    layerWidth: Number,
  });

  const formVisible = ref(false);
  const handleOpen = () => {
    formVisible.value = true;
  };
</script>

<style lang="less">
  @import './layerLayout';
</style>
