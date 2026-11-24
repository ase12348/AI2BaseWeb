<template>
  <lr-modal-full
    v-if="layerType === 'full'"
    ref="modalRef"
    v-model:visible="visible"
    v-model:step-active="stepActive"
    :title="title"
    :before-close="beforeClose"
    :is-step="isStep"
    :steps="steps"
    :validate-steps="validateSteps"
    :has-btns="hasBtns"
    :btn-text="btnText"
    :destroy-on-close="destroyOnClose"
    :buttons="buttons"
    :has-save-btn="hasSaveBtn"
    :has-header="hasHeader"
    :subtitle="subtitle"
    @ok="handleOk"
    @closed="handleClosed"
    @cancel="handleCancel"
  >
    <slot></slot>
  </lr-modal-full>
  <lr-drawer
    v-else-if="layerType === 'drawer'"
    v-model:open="visible"
    :title="title"
    :before-close="beforeClose"
    :width="width"
    :has-btns="hasBtns"
    :btn-text="btnText"
    :has-save-btn="hasSaveBtn"
    @ok="handleOk"
    @closed="handleClosed"
    @cancel="handleCancel"
  >
    <slot></slot>
    <template #btns>
      <slot name="btns"></slot>
    </template>
  </lr-drawer>
  <lr-modal
    v-else
    ref="modalRef"
    v-model:visible="visible"
    v-model:step-active="stepActive"
    :width="width"
    :height="height"
    :title="title"
    :before-close="beforeClose"
    :has-btns="hasBtns"
    :btn-text="btnText"
    :destroy-on-close="destroyOnClose"
    :buttons="buttons"
    :has-save-btn="hasSaveBtn"
    :is-step="isStep"
    :steps="steps"
    :validate-steps="validateSteps"
    :subtitle="subtitle"
    :hidden="hidden"
    @ok="handleOk"
    @closed="handleClosed"
    @cancel="handleCancel"
  >
    <slot></slot>
  </lr-modal>
</template>

<script lang="ts" setup>
  import type { buttonItem } from '../buttons/interface';

  import { ref, provide, PropType } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('layer').name });

  defineProps({
    /**
     * @zh 宽度
     * @defaultValue 600
     */
    width: {
      type: [String, Number],
      default: 600,
    },
    /**
     * @zh 高度
     * @defaultValue 400
     */
    height: {
      type: Number,
      default: 400,
    },
    /**
     * @zh 是否需要步骤条
     * @defaultValue false
     */
    isStep: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 步骤名称
     * @defaultValue []
     */
    steps: {
      type: Array<string>,
      default: () => [],
    },
    /**
     * @zh 是否有表头
     * @defaultValue true
     */
    hasHeader: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否需要"取消""确定"按钮
     * @defaultValue true
     */
    hasBtns: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否需要保存按钮
     * @defaultValue true
     */
    hasSaveBtn: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 确定按钮文字
     */
    btnText: String,
    /**
     * @zh 扩展按钮
     */
    buttons: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
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
     * @zh 到下一步校验
     */
    validateSteps: Function,
    /**
     * @zh 弹窗关闭前
     */
    beforeClose: Function,
    /**
     * @zh 是否隐藏
     * @defaultValue false
     */
    hidden: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits({
    /**
     * @zh 点击确定回调
     * @property showLoading: (text: string) => void,hideLoading: () => void
     */
    ok: (showLoading: (text: string) => void, hideLoading: () => void) => true,
    /**
     * @zh Modal 完全关闭后的回调
     */
    closed: () => true,
    /**
     * @zh Modal 点击关闭按钮取消回调
     */
    cancel: () => true,
  });

  const visible = ref(false);
  const title = ref('');
  const modalRef = ref();
  const stepActive = ref(0);
  const layerType = ref('');
  const subtitle = ref();

  const pOpen = (layerTitle: string, type?: string, layerSubtitle?: any) => {
    title.value = layerTitle;
    subtitle.value = layerSubtitle;
    layerType.value = type || 'modal';
    visible.value = true;
  };

  const pClose = () => {
    visible.value = false;
  };

  const handleOk = (showLoading: (text: string) => void, hideLoading: () => void) => {
    emit('ok', showLoading, hideLoading);
  };

  const handleClosed = () => {
    stepActive.value = 0;
    emit('closed');
  };

  const handleCancel = () => {
    emit('cancel');
  };

  const pShowLoading = (text?: string) => {
    modalRef.value && modalRef.value.showLoading(text);
  };
  const pHideLoading = () => {
    modalRef.value && modalRef.value.hideLoading();
  };
  const pSetTitle = (title: string) => {
    modalRef.value && modalRef.value.setTitle(title);
  };
  const pSetSubTitle = (title: any) => {
    modalRef.value && modalRef.value.setSubTitle(title);
  };

  provide('jcode_layer_provide', {
    stepActive,
  });

  /**
   * @zh 打开弹窗
   * @public
   * @param title
   * @param type
   */
  function open(title: string, type?: string, subtitle?: any) {
    pOpen(title, type, subtitle);
  }
  /**
   * @zh 关闭弹窗
   * @public
   */
  function close() {
    pClose();
  }
  /**
   * @zh 弹窗开启加载状态
   * @public
   * @param text
   */
  function showLoading(text?: string) {
    pShowLoading(text);
  }
  /**
   * @zh 弹窗关闭加载状态
   * @public
   */
  function hideLoading() {
    pHideLoading();
  }
  /**
   * @zh 设置弹窗标题
   * @public
   */
  function setTitle(title: string) {
    pSetTitle(title);
  }
  /**
   * @zh 设置弹窗副标题
   * @public
   */
  function setSubTitle(subTitle: any) {
    pSetSubTitle(subTitle);
  }

  defineExpose({
    open,
    close,
    showLoading,
    hideLoading,
    setTitle,
    setSubTitle,
  });
</script>

<style lang="less">
  @import './layer';
</style>
