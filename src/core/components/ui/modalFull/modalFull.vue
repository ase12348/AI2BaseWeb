<template>
  <div>
    <a-modal
      v-model:open="midVisible"
      wrap-class-name="lr-modal-full"
      :closable="false"
      :footer="null"
      :destroy-on-close="destroyOnClose"
      :after-close="afterClose"
      :keyboard="keyboard"
      :force-render="forceRender"
      :width="hidden ? '0' : '100%'"
      :height="hidden ? '0' : '100%'"
    >
      <a-spin v-show="!hidden" :spinning="loading" :tip="loadingText">
        <div class="lr-modal-full-window">
          <div v-if="hasHeader" class="lr-modal-full-header" ref="modalTitleRef">
            <div class="lr-modal-full-header-left">
              <img
                v-if="logoImg"
                class="lr-modal-full-header-logo"
                :src="logoImg"
                style="margin-right: 8px"
              />
              <slot name="title">
                <a-typography-text
                  ellipsis
                  style="height: 28px; margin: 0; font-size: 16px; line-height: 32px"
                  :content="$t(myTitle)"
                />
                <span style="height: 28px; margin-left: 8px; line-height: 32px">
                  <component v-if="subtitle || mySubtitle" :is="mySubtitle" />
                </span>
              </slot>
            </div>
            <div
              class="lr-modal-full-header-mid"
              :style="{ maxWidth: `${200 * stepList.length}px` }"
            >
              <a-steps v-model:current="myStepActive" :items="stepList" />
            </div>
            <div class="lr-modal-full-header-right">
              <slot name="btns">
                <a-space :size="0">
                  <a-space v-if="hasBtns">
                    <lr-button v-if="isStep" @click="prev" size="mini" :disabled="stepPrevBtn">{{
                      $t('上一步')
                    }}</lr-button>
                    <lr-button
                      v-if="isStep"
                      @click="next"
                      size="mini"
                      :disabled="stepNextBtn"
                      :loading="nextBtnLoading"
                      >{{ $t('下一步') }}</lr-button
                    >
                    <template v-for="btn of buttons" :key="btn.prop || btn.label || btn.icon">
                      <lr-button
                        v-if="btn.display !== false"
                        :label="btn.label"
                        :danger="btn.danger"
                        :ghost="btn.ghost"
                        :type="btn.type"
                        :disabled="btn.disabled"
                        @click="handleClick(btn)"
                      >
                        <template v-if="btn.icon" #icon>
                          <lr-icon
                            :icon="btn.icon"
                            :is-div="!btn.label"
                            :class="{ 'lr-buttons-icon': btn.label }"
                          />
                        </template>
                        {{ btn.label }}
                      </lr-button>
                    </template>
                    <slot name="btn"> </slot>
                    <lr-button
                      v-if="hasSaveBtn"
                      size="mini"
                      type="primary"
                      @click="handleOk"
                      :disabled="stepSaveBtn && isStep"
                      >{{ $t(btnText || '保存') }}</lr-button
                    >
                  </a-space>
                  <a-divider v-if="showCloseBtn && hasBtns" type="vertical" style="margin: 0 8px" />
                  <lr-button v-if="showCloseBtn" @click="handleClose" type="text">
                    <template #icon>
                      <lr-icon icon="ant-design:close-outlined" :size="18" />
                    </template>
                  </lr-button>
                </a-space>
              </slot>
            </div>
          </div>
          <a-float-button
            v-else
            type="primary"
            :style="{
              top: '16px',
              right: '16px',
            }"
            @click="handleClose"
          >
            <template #icon>
              <lr-icon icon="ant-design:close-outlined" :size="18" />
            </template>
          </a-float-button>
          <div class="lr-modal-full-body">
            <slot></slot>
          </div>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import type { buttonItem } from '../buttons/interface';
  import { computed, watch, ref, nextTick, inject, PropType } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('modalFull').name });

  const props = defineProps({
    /**
     * @zh 是否显示
     * @defaultValue false
     */
    visible: {
      type: Boolean,
    },
    /**
     * @zh 标题
     */
    title: String,
    /**
     * @zh 关闭时销毁抽屉内的元素
     * @defaultValue false
     */
    destroyOnClose: {
      type: Boolean,
      default: false,
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
     * @zh 是否显示关闭按钮
     * @defaultValue true
     */
    showCloseBtn: {
      type: Boolean,
      default: true,
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
     * @zh 步骤条初始页码
     * @defaultValue 0
     */
    stepActive: {
      type: Number,
      default: 0,
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
     * @zh 到下一步校验
     */
    validateSteps: Function,
    /**
     * @zh 是否显示
     */
    hidden: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 强制渲染 Modal
     */
    forceRender: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否支持键盘 esc 关闭，与afterClose一起使用控制visible的关闭
     */
    keyboard: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 弹窗关闭前
     */
    beforeClose: Function,
    /**
     * @zh 扩展按钮
     */
    buttons: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
    subtitle: Function,
  });

  const emit = defineEmits({
    'update:stepActive': (val: number) => true,
    'update:visible': (val: boolean) => true,
    /**
     * @zh 点击遮罩层或右上角叉或取消按钮的回调
     */
    cancel: () => true,
    /**
     * @zh 点击确定回调
     * @property showLoading: (text: string) => void,hideLoading: () => void
     */
    ok: (showLoading: (text: string) => void, hideLoading: () => void) => true,
    /**
     * @zh Modal 完全关闭后的回调
     */
    closed: () => true,
  });

  const { logoImg } = inject('jcode_app_provide', {
    logoImg: '',
  } as Record<string, any>);

  // 参数定义
  const midVisible = ref(false);
  const loading = ref(false);
  const loadingText = ref('');
  const nextBtnLoading = ref(false);

  const stepPrevBtn = ref(true);
  const stepNextBtn = ref(false);
  const stepSaveBtn = ref(true);
  const myStepActive_ = ref(-1);

  watch(
    () => props.visible,
    (newValue) => {
      midVisible.value = newValue;
    },
    { immediate: true },
  );

  const myStepActive = computed({
    get() {
      if (myStepActive_.value !== -1) {
        return myStepActive_.value;
      }
      return props.stepActive;
    },
    set(val) {
      myStepActive_.value = val;
      emit('update:stepActive', val);
    },
  });

  // 按钮
  const handleClose = () => {
    if (props.beforeClose && props.beforeClose() === false) {
      return;
    }

    midVisible.value = false;
    emit('update:visible', false);
    emit('cancel');
  };

  const handleOk = () => {
    emit('ok', pShowLoading, pHideLoading);
  };
  const afterClose = () => {
    if (props.isStep) {
      myStepActive.value = 0;
      nextTick(() => {
        updateBtnState();
      });
    }
    modelTitle.value = 'jcode_title';
    setSubtitle2.value = undefined;
    emit('closed');
  };
  const pShowLoading = (text?: string) => {
    loadingText.value = text || '保存数据中...';
    loading.value = true;
  };
  const pHideLoading = () => {
    loading.value = false;
  };

  // 带步骤的表单
  const prev = () => {
    if (myStepActive.value > 0) {
      myStepActive.value--;
    }
    nextTick(() => {
      updateBtnState();
    });
  };
  const next = async () => {
    if (await myValidateSteps()) {
      if (myStepActive.value < props.steps.length - 1) {
        myStepActive.value += 1;
      }

      nextTick(() => {
        updateBtnState();
      });
    }
  };
  const myValidateSteps = async () => {
    nextBtnLoading.value = true;
    if (props.validateSteps) {
      const res = await props.validateSteps(props.stepActive, pShowLoading, pHideLoading);
      nextBtnLoading.value = false;
      return res;
    }
    nextBtnLoading.value = false;
    return true;
  };
  const updateBtnState = () => {
    stepSaveBtn.value = true;
    stepNextBtn.value = true;
    stepPrevBtn.value = true;
    switch (myStepActive.value) {
      case 0:
        stepNextBtn.value = false;
        break;
      case props.steps.length - 1:
        stepPrevBtn.value = false;
        stepSaveBtn.value = false;
        break;
      default:
        stepPrevBtn.value = false;
        stepNextBtn.value = false;
        break;
    }
  };
  const stepList = computed(() => props.steps.map((t) => ({ title: t, disabled: true })));

  const handleClick = async (btn: any) => {
    if (btn.click) {
      await btn.click();
    }
  };

  const modelTitle = ref('jcode_title');
  const myTitle = computed(() => {
    if (modelTitle.value === 'jcode_title') {
      return props.title || '';
    }
    return modelTitle.value;
  });
  const pSetTitle = (title: string) => {
    modelTitle.value = title;
  };
  const setSubtitle2 = ref();
  const pSetSubTitle = (subTitle: any) => {
    setSubtitle2.value = subTitle;
  };
  const mySubtitle = computed(() => {
    if (setSubtitle2?.value) {
      return setSubtitle2.value;
    }
    if (props.subtitle) {
      return props.subtitle();
    }
    return undefined;
  });

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

  defineExpose({ showLoading, hideLoading, setTitle, setSubTitle });
</script>

<style lang="less">
  @import './modalFull';
</style>
