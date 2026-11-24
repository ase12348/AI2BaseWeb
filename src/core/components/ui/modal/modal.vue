<template>
  <a-modal
    v-model:open="midVisible"
    :wrap-class-name="myClass"
    :closable="false"
    :footer="null"
    :destroy-on-close="destroyOnClose"
    :mask="mask"
    :mask-style="maskStyle"
    :mask-closable="false"
    :after-close="afterClose"
    :keyboard="keyboard"
    :force-render="forceRender"
    :width="hidden ? '0' : isFullscreen ? '100%' : `${latestWidth || numberWidth}px`"
    :height="hidden ? '0' : undefined"
    :style="
      isMin
        ? undefined
        : {
            position: 'fixed',
            left: `${left + move.left}px`,
            top: `${top + move.top}px`,
            'pointer-events': mask ? '' : 'none',
          }
    "
  >
    <a-spin v-show="!hidden" :spinning="loading" :tip="loadingText">
      <div class="lr-modal-header" @mousedown="onMousedown" ref="modalTitleRef">
        <div
          class="lr-modal-header-left"
          :title="$t(title)"
          :style="{ cursor: !autoHeight && !isMin ? 'move' : '' }"
        >
          <slot name="title">
            <a-typography-text ellipsis style="margin: 0; font-size: 14px" :content="$t(title)" />
            <span style="margin-left: 8px">
              <component v-if="subtitle" :is="subtitle()" />
            </span>
          </slot>
        </div>

        <a-space :size="0">
          <lr-button v-if="showMinBtn" @click="handleMin" type="text">
            <template #icon>
              <lr-icon
                :icon="isMin ? 'ant-design:arrows-alt-outlined' : 'ant-design:shrink-outlined'"
                :size="18"
              />
            </template>
          </lr-button>
          <lr-button v-if="showFullscreenBtn" @click="handleIsFull" type="text">
            <template #icon>
              <lr-icon
                :icon="isFullscreen ? 'ant-design:compress-outlined' : 'ant-design:expand-outlined'"
                :size="18"
              />
            </template>
          </lr-button>
          <lr-button v-if="showCloseBtn" @click="handleClose" type="text">
            <template #icon>
              <lr-icon icon="ant-design:close-outlined" :size="18" />
            </template>
          </lr-button>
        </a-space>
      </div>
      <div
        v-show="!isMin"
        :class="[
          'lr-modal-window',
          { 'lr-modal-window-hasBtns': hasBtns },
          { 'lr-modal-window-hasSteps': isStep },
          modelClassName,
        ]"
        :style="{
          height: autoHeight ? 'auto' : (latestHeight > 0 ? latestHeight : heightComputed) + 'px',
        }"
      >
        <div v-if="isStep" class="lr-modal-steps">
          <div :style="{ maxWidth: `${200 * stepList.length}px`, width: '100%' }">
            <a-steps v-model:current="myStepActive" :items="stepList" />
          </div>
        </div>

        <slot></slot>

        <div class="lr-modal-btns" v-if="hasBtns">
          <slot name="btns">
            <a-space :size="8">
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
              <lr-button
                v-if="!isStep && showCloseBtn && hasCloseBtn"
                size="mini"
                @click="handleClose"
                >{{ $t('取消') }}</lr-button
              >
              <lr-button
                v-for="btn of buttons"
                :key="btn.prop"
                :label="btn.label"
                :danger="btn.danger"
                :ghost="btn.ghost"
                :type="btn.type"
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
          </slot>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script lang="ts" setup>
  import type { buttonItem } from '../buttons/interface';
  import { PropType, computed, watch, ref, reactive, nextTick } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('modal').name });

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
     * @zh 副标题
     */
    subtitle: Function,
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
    minWidth: {
      type: Number,
      default: 300,
    },
    minHeight: {
      type: Number,
      default: 200,
    },
    /**
     * @zh 是否需要遮罩层
     * @defaultValue true
     */
    mask: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 遮罩样式
     * @defaultValue {}
     */
    maskStyle: {
      type: Object,
      default: () => {},
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
     * @zh 是否需要"取消""确定"按钮
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
     * @zh 是否显示关闭按钮(设置为false时，头部x按钮不显示)
     * @defaultValue true
     */
    showCloseBtn: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否显示关闭按钮(只影响底部的取消按钮)
     * @defaultValue true
     */
    hasCloseBtn: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否显示最小化按钮
     * @defaultValue true
     */
    showMinBtn: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示最大化按钮
     * @defaultValue true
     */
    showFullscreenBtn: {
      type: Boolean,
      default: true,
    },

    /**
     * @zh 动态高度
     * @defaultValue false
     */
    autoHeight: {
      type: Boolean,
      default: false,
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
     * @zh 显示位置
     * @defaultValue center
     */
    placement: {
      type: String as PropType<
        | 'top'
        | 'top-left'
        | 'top-right'
        | 'left'
        | 'center'
        | 'right'
        | 'bottom-left'
        | 'bottom'
        | 'bottom-right'
      >,
      default: 'center',
    },
    /**
     * @zh 是否开启缩放控制
     * @defaultValue false
     */
    zoomControls: {
      type: Boolean,
      default: true,
    },

    /**
     * @zh 是否显示
     * @defaultValue false
     */
    hidden: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 强制渲染 Modal
     * @defaultValue false
     */
    forceRender: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否支持键盘 esc 关闭，与afterClose一起使用控制visible的关闭
     * @defaultValue false
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
     * @zh 弹窗类名
     */
    modelClassName: {
      type: String,
    },
    /**
     * @zh 扩展按钮
     */
    buttons: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
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

  // 参数定义
  const midVisible = ref(false);
  const loading = ref(false);
  const loadingText = ref('');
  const nextBtnLoading = ref(false);

  const stepPrevBtn = ref(true);
  const stepNextBtn = ref(false);
  const stepSaveBtn = ref(true);
  const myStepActive_ = ref(-1);

  const move = reactive({
    isMove: false,
    pageX: 0,
    pageY: 0,

    left: 0,
    top: 0,

    _left: 0,
    _top: 0,
  });
  let moveTop = 0;
  let moveLeft = 0;
  const isMin = ref(false);
  const isFullscreen = ref(false);

  const flag = ref(0);
  const elDialogDom = ref();
  const elDialogHeaderH = ref(48);
  const latestWidth = ref(0);
  const latestHeight = ref(0);
  const height_ = ref(0);

  watch(
    () => props.visible,
    (newValue) => {
      flag.value = 1;
      flag.value = 0;
      midVisible.value = newValue;

      // 是否支持缩放
      if (newValue === true && props.zoomControls) {
        nextTick(() => {
          elDialogDom.value = document.querySelector('.ant-modal');
          elDialogDom.value.onmousemove = elDialogOnMousemove;
        });
      }
    },
    { immediate: true },
  );
  watch(isFullscreen, (n) => {
    if (n === true) {
      moveTop = move.top;
      moveLeft = move.left;
      move.top = 0;
      move.left = 0;
      if (latestHeight.value) {
        height_.value = latestHeight.value;
        latestHeight.value = document.body.clientHeight - elDialogHeaderH.value;
      }
      isMin.value = false;
    } else {
      move.top = moveTop;
      move.left = moveLeft;
      latestHeight.value = height_.value;
    }
  });

  const myClass = computed(() => {
    let _class = '';
    _class = 'lr-modal';
    if (isMin.value) {
      _class += ` lr-modal-min lr-modal-bottom-right`;
    } else if (props.autoHeight) {
      _class += ` lr-modal-${props.placement}`;
    }
    return _class;
  });

  const heightComputed = computed(() => {
    if (isFullscreen.value) {
      return document.body.clientHeight - elDialogHeaderH.value;
    }
    let _height = props.height + flag.value;
    if (_height + 40 > document.body.clientHeight) {
      _height = document.body.clientHeight - 32 - 40;
    }
    return _height;
  });
  const left = computed(() => {
    let _left = 0 + flag.value;
    if (!isFullscreen.value) {
      if (['top', 'center', 'bottom'].includes(props.placement)) {
        _left = (document.body.clientWidth - numberWidth.value) / 2;
      } else if (['top-left', 'left', 'bottom-left'].includes(props.placement)) {
        _left = 16;
      } else if (['top-right', 'right', 'bottom-right'].includes(props.placement)) {
        _left = document.body.clientWidth - numberWidth.value - 16;
      }
    }
    return _left;
  });
  const top = computed(() => {
    let _top = 0 + flag.value;
    if (!isFullscreen.value) {
      if (['top', 'top-left', 'top-right'].includes(props.placement)) {
        _top = 16;
      } else if (['left', 'center', 'right'].includes(props.placement)) {
        _top = (document.body.clientHeight - heightComputed.value - 40) / 2;
      } else if (['bottom-left', 'bottom', 'bottom-right'].includes(props.placement)) {
        _top = document.body.clientHeight - heightComputed.value - 40 - 16;
      }
    }
    return _top;
  });
  const numberWidth = computed(() => {
    let _width = 0 + flag.value;
    if (typeof props.width === 'string') {
      if (props.width.indexOf('px') > -1) {
        _width = Number(props.width.replace('px', ''));
      } else {
        _width = (Number(props.width.replace('%', '')) * document.body.clientWidth) / 100;
      }
    } else {
      _width = props.width;
    }

    if (_width > document.body.clientWidth) {
      _width = document.body.clientWidth - 32;
    }
    return _width;
  });

  // 按钮
  const handleClose = () => {
    if (props.beforeClose && props.beforeClose() === false) {
      return;
    }

    midVisible.value = false;
    isMin.value = false;
    isFullscreen.value = false;
    emit('update:visible', false);

    emit('cancel');
  };
  const handleMin = () => {
    isMin.value = !isMin.value;
    if (isMin.value) {
      isFullscreen.value = false;
    }
  };
  const handleIsFull = () => {
    isFullscreen.value = !isFullscreen.value;
  };

  const handleOk = () => {
    emit('ok', pShowLoading, pHideLoading);
  };
  const afterClose = () => {
    move.left = 0;
    move.top = 0;
    latestHeight.value = 0;
    latestWidth.value = 0;
    isMin.value = false;
    isFullscreen.value = false;
    if (props.isStep) {
      myStepActive.value = 0;
      nextTick(() => {
        updateBtnState();
      });
    }
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

  // 拖动
  const onMousedown = function (e: MouseEvent) {
    if (props.autoHeight || isMin.value) {
      return;
    }

    move.pageX = e.pageX;
    move.pageY = e.pageY;

    move._left = move.left;
    move._top = move.top;
    move.isMove = true;

    document.onmouseup = onMouseup;
    document.onmousemove = onMousemove;
  };
  const onMouseup = () => {
    move.isMove = false;
    document.onmouseup = null;
    document.onmousemove = null;
  };
  const onMousemove = (e: MouseEvent) => {
    if (move.isMove) {
      const x = e.pageX - move.pageX;
      const y = e.pageY - move.pageY;

      let _left = move._left + x;
      let _top = move._top + y;

      if (_left + left.value < 0) {
        _left = -left.value;
      }
      if (latestWidth.value) {
        if (_left + latestWidth.value + left.value > document.body.clientWidth) {
          _left = document.body.clientWidth - latestWidth.value - left.value;
        }
      } else if (_left + numberWidth.value + left.value > document.body.clientWidth) {
        _left = document.body.clientWidth - numberWidth.value - left.value;
      }

      if (_top + top.value < 0) {
        _top = -top.value;
      }
      if (latestHeight.value) {
        if (_top + latestHeight.value + top.value + 40 > document.body.clientHeight) {
          _top = document.body.clientHeight - latestHeight.value - top.value - 40;
        }
      } else if (_top + heightComputed.value + top.value + 40 > document.body.clientHeight) {
        _top = document.body.clientHeight - heightComputed.value - top.value - 40;
      }

      move.left = _left;
      move.top = _top;
      if (isFullscreen.value) {
        isFullscreen.value = !isFullscreen.value;
      }
    }
  };

  // 缩放
  const elDialogOnMousemove = (e: MouseEvent) => {
    const dialogOffsetLeft = elDialogDom.value.offsetLeft;
    const dialogOffsetTop = elDialogDom.value.offsetTop;
    const elW = elDialogDom.value.clientWidth;
    const elH = elDialogDom.value.clientHeight;
    const elBodyH = elH - elDialogHeaderH.value;
    const ELscrollTop = elDialogDom.value.scrollTop;

    if (
      (e.clientX > dialogOffsetLeft + elW - 10 &&
        ELscrollTop + e.clientY > dialogOffsetTop + elH - 10) ||
      (ELscrollTop + e.clientY < dialogOffsetTop + 5 && dialogOffsetLeft + 10 > e.clientX)
    ) {
      elDialogDom.value.style.cursor = 'se-resize';
    } else if (
      (dialogOffsetLeft + 10 > e.clientX && ELscrollTop + e.clientY > dialogOffsetTop + elH - 10) ||
      (e.clientX > dialogOffsetLeft + elW - 10 && ELscrollTop + e.clientY < dialogOffsetTop + 5)
    ) {
      elDialogDom.value.style.cursor = 'sw-resize';
    } else if (e.clientX > dialogOffsetLeft + elW - 10 || dialogOffsetLeft + 10 > e.clientX) {
      elDialogDom.value.style.cursor = 'w-resize';
    } else if (
      ELscrollTop + e.clientY > dialogOffsetTop + elH - 10 ||
      ELscrollTop + e.clientY < dialogOffsetTop + 5
    ) {
      elDialogDom.value.style.cursor = 's-resize';
    } else {
      elDialogDom.value.style.cursor = 'default';
      elDialogDom.value.onmousedown = null;
      return;
    }
    elDialogDom.value.onmousedown = (e: MouseEvent) => {
      const { clientX } = e;
      const { clientY } = e;
      const EloffsetLeft = move.left + left.value;
      const EloffsetTop = move.top + top.value;
      move._left = move.left;
      move._top = move.top;
      if (!latestHeight.value) latestHeight.value = elBodyH;
      if (!latestWidth.value) latestWidth.value = elW;
      if (
        clientX > EloffsetLeft + 10 &&
        clientX < EloffsetLeft + elW - 10 &&
        clientY > EloffsetTop + 5 &&
        clientY < EloffsetTop + 47
      ) {
        /* empty */
      } else {
        document.onmousemove = function (e) {
          e.preventDefault();
          if (clientX > EloffsetLeft && clientX < EloffsetLeft + 10) {
            if (clientX > e.clientX) {
              latestWidth.value = elW + (clientX - e.clientX);
              move.left = move._left - (clientX - e.clientX);
            }
            if (clientX < e.clientX && latestWidth.value > props.minWidth) {
              latestWidth.value = elW - (e.clientX - clientX);
              move.left = move._left + e.clientX - clientX;
            }
          }
          if (clientX > EloffsetLeft + elW - 10 && clientX < EloffsetLeft + elW) {
            if (clientX > e.clientX && latestWidth.value > props.minWidth) {
              latestWidth.value = elW - (clientX - e.clientX);
            }
            if (
              clientX < e.clientX &&
              left.value + move.left + latestWidth.value < document.body.clientWidth
            ) {
              latestWidth.value = elW + (e.clientX - clientX);
            }
          }
          if (clientY > EloffsetTop && clientY < EloffsetTop + 5) {
            if (clientY > e.clientY) {
              latestHeight.value = elBodyH + clientY - e.clientY;
              move.top = move._top - (clientY - e.clientY);
            }
            if (clientY < e.clientY && latestHeight.value > props.minHeight) {
              latestHeight.value = elBodyH - (e.clientY - clientY);
              move.top = move._top + e.clientY - clientY;
            }
          }
          if (
            ELscrollTop + clientY > EloffsetTop + elBodyH + 38 &&
            ELscrollTop + clientY < EloffsetTop + elBodyH + 48
          ) {
            if (clientY > e.clientY && latestHeight.value > props.minHeight) {
              latestHeight.value = elBodyH - (clientY - e.clientY);
            }
            if (
              clientY < e.clientY &&
              top.value + move.top + latestHeight.value + 48 < document.body.clientHeight
            ) {
              latestHeight.value = elBodyH + e.clientY - clientY;
            }
          }
        };
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      }
    };
  };

  const handleClick = async (btn: any) => {
    if (btn.click) {
      await btn.click();
    }
  };

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

  defineExpose({ showLoading, hideLoading });
</script>

<style lang="less">
  @import './modal';
</style>
