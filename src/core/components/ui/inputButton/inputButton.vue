<template>
  <lr-button
    v-bind="$attrs"
    :type="type"
    :label="btnText"
    :size="size"
    @click="handleOpen"
    style="width: auto"
  />
  <a-form-item-rest>
    <lr-layer
      :height="height"
      :width="width"
      :destroy-on-close="destroyOnClose"
      btn-text="确定"
      :before-close="beforeFormClose"
      @ok="handleOk"
      @closed="handleClosed"
      ref="layerRef"
    >
      <slot></slot>
    </lr-layer>
  </a-form-item-rest>
</template>

<script lang="ts" setup>
  import { PropType, ref, watch } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('inputButton').name });

  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: [String, Object] as PropType<string | Record<string, any>>,
      default: undefined,
    },
    /**
     * @zh 按钮的类型，分为五种：主要按钮、幽灵按钮、虚框按钮、链接按钮、文字按钮、次要按钮。
     * @defaultValue 'default'
     */
    type: {
      type: String as PropType<'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default'>,
    },
    /**
     * @zh 弹窗类型，弹窗、全屏弹窗、抽屉。
     * @defaultValue 'model'
     */
    layerType: {
      type: String as PropType<'model' | 'full' | 'drawer'>,
    },
    /**
     * @zh 设置按钮文字
     */
    btnText: {
      type: String,
      default: '设置',
    },
    /**
     * @zh 弹窗标题
     */
    title: String,
    /**
     * @zh 设置按钮大小
     * @defaultValue 'middle'
     */
    size: {
      type: String as PropType<'large' | 'middle' | 'small'>,
    },
    /**
     * @zh 宽度
     * @defaultValue 1000
     */
    width: {
      type: [String, Number],
      default: 1000,
    },
    /**
     * @zh 高度
     * @defaultValue 600
     */
    height: {
      type: Number,
      default: 600,
    },
    /**
     * @zh 关闭时销毁抽屉内的元素
     * @defaultValue false
     */
    destroyOnClose: {
      type: Boolean,
      default: false,
    },

    /**
     * @zh 弹窗打开回调
     */
    open: Function,
    /**
     * @zh 弹窗保存回调
     */
    ok: Function,
    /**
     * @zh 弹窗关闭前回调
     */
    beforeClose: Function,
    /**
     * @zh 弹窗关闭后回调
     */
    closed: Function,
  });

  const emit = defineEmits({
    'update:value': (val: string | Record<string, any> | undefined) => true,
    /**
     * @zh 值变化时触发
     */
    change: (data: { value: string | Record<string, any> | undefined }) => true,
  });

  const layerRef = ref();
  const inputValue = ref<string | Record<string, any> | undefined>();

  const { ok, beforeClose, closed, open } = props;

  const handleOk = async (showLoading: any, hideLoading: any) => {
    if (ok) {
      showLoading('保存数据中...');
      inputValue.value = await ok();
      emit('update:value', inputValue.value);
      emit('change', { value: inputValue.value });

      hideLoading();
      layerRef.value.close();
    }
  };

  const beforeFormClose = () => {
    if (beforeClose) {
      return beforeClose(inputValue.value);
    }
    return true;
  };

  const handleClosed = () => {
    closed && closed();
  };

  const handleOpen = () => {
    layerRef.value.open(props.title || props.btnText, props.layerType);
    setTimeout(() => {
      open && open(inputValue.value);
    }, 200);
  };

  watch(
    () => props.value,
    (value) => {
      inputValue.value = value;
    },
    { immediate: true },
  );
</script>

<style lang="less">
  @import './inputButton';
</style>
