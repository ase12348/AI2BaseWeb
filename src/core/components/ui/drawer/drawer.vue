<template>
  <a-drawer
    v-bind="myProps"
    v-model:open="modelOpen"
    root-class-name="lr-root-drawer"
    :title="$t(myProps.title)"
    @close="handleClose"
    @after-open-change="handleAfterOpenChange"
  >
    <template #extra>
      <slot name="extra"></slot>
    </template>

    <template #footer v-if="hasBtns">
      <div class="l-drawer-footer">
        <slot name="btns">
          <a-space :size="8">
            <lr-button style="margin-right: 8px" @click="handleCloseBtn">{{
              $t('取消')
            }}</lr-button>
            <slot name="btn"></slot>
            <lr-button type="primary" @click="handleOK">{{ $t(btnText || '保存') }}</lr-button>
          </a-space>
        </slot>
      </div>
    </template>

    <template #title>
      <slot name="title"></slot>
    </template>

    <slot></slot>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { PropType, computed, CSSProperties, VNode } from 'vue';
  import { objectType } from '../utils/type';

  type getContainerFunc = () => HTMLElement;
  defineOptions({ name: 'LrDrawer' });

  const props = defineProps({
    /**
     * @zh 抽屉展开后是否将焦点切换至其 Dom 节点
     * @defaultValue true
     */
    autofocus: { type: Boolean, default: undefined },
    /**
     * @zh 用于设置 Drawer 头部的样式
     * @values CSSProperties
     */
    headerStyle: objectType<CSSProperties>(),
    /**
     * @zh 可用于设置 Drawer 内容部分的样式
     * @values CSSProperties
     */
    bodyStyle: objectType<CSSProperties>(),
    /**
     * @zh 可用于设置 Drawer 包裹内容部分的样式
     * @values CSSProperties
     */
    contentWrapperStyle: objectType<CSSProperties>(),
    /**
     * @zh 是否显示左上角的关闭按钮
     * @defaultValue true
     */
    closable: { type: Boolean, default: undefined },
    /**
     * @zh 自定义关闭图标
     * @defaultValue <CloseOutlined />
     */
    closeIcon: {
      type: Object as PropType<VNode>,
      default: undefined,
    },
    /**
     * @zh 关闭时销毁 Drawer 里的子元素
     * @defaultValue false
     */
    destroyOnClose: { type: Boolean, default: undefined },
    /**
     * @zh 抽屉右上角的操作区域
     */
    extra: {
      type: Object as PropType<VNode>,
    },
    /**
     * @zh 抽屉的页脚
     */
    footer: {
      type: Object as PropType<VNode>,
    },
    /**
     * @zh 抽屉页脚部件的样式
     * @values CSSProperties
     */
    footerStyle: objectType<CSSProperties>(),
    /**
     * @zh 预渲染 Drawer 内元素
     * @defaultValue false
     */
    forceRender: { type: Boolean, default: undefined },
    /**
     * @zh 指定 Drawer 挂载的节点，并在容器内展现 | () => HTMLElement | Selectors
     * @defaultValue 'body'
     */
    getContainer: {
      type: [String, Function, Boolean, Object] as PropType<
        string | HTMLElement | getContainerFunc | false
      >,
      default: undefined,
    },
    /**
     * @zh 高度, 在 placement 为 top 或 bottom 时使用
     * @defaultValue 378
     */
    height: { type: [Number, String] as PropType<number | string>, default: undefined },
    /**
     * @zh 宽度
     * @defaultValue 378
     */
    width: { type: [Number, String] as PropType<number | string>, default: undefined },
    /**
     * @zh 设置 Drawer 的 z-index
     */
    zIndex: {
      type: Number,
      default: 1000,
    },
    /**
     * @zh 	预设抽屉宽度（或高度），default 378px 和 large 736px
     */
    size: {
      type: String as PropType<'default' | 'large'>,
      default: 'default',
    },
    /**
     * @zh 是否支持键盘 esc 关闭
     * @defaultValue true
     */
    keyboard: { type: Boolean, default: undefined },
    /**
     * @zh 是否展示遮罩
     * @defaultValue true
     */
    mask: { type: Boolean, default: undefined },
    /**
     * @zh 点击蒙层是否允许关闭
     * @defaultValue true
     */
    maskClosable: { type: Boolean, default: undefined },
    /**
     * @zh 遮罩样式
     * @values CSSProperties
     */
    maskStyle: objectType<CSSProperties>(),
    /**
     * @zh 抽屉的方向
     */
    placement: {
      type: String as PropType<'top' | 'right' | 'bottom' | 'left'>,
      default: 'right',
    },
    /**
     * @zh 用于设置多层 Drawer 的推动行为
     * @defaultValue { distance: 180 }
     */
    push: {
      type: [Boolean, Object] as PropType<boolean | { distance: string | number }>,
      default: undefined,
    },
    /**
     * @zh 可用于设置 Drawer 最外层容器的样式，和 style 的区别是作用节点包括 mask
     * @values CSSProperties
     */
    rootStyle: objectType<CSSProperties>(),
    /**
     * @zh 标题
     */
    title: {
      type: String,
    },
    /**
     * @zh 弹窗关闭前
     */
    beforeClose: Function,
    /**
     * @zh Drawer 是否可见
     * @vModel
     */
    open: { type: Boolean as PropType<boolean>, default: undefined },
    /**
     * @zh Drawer 是否有底部条
     */
    hasBtns: { type: Boolean as PropType<boolean>, default: true },
    /**
     * @zh 确定按钮文字
     */
    btnText: String,
  });

  const emit = defineEmits({
    'update:open': (open: boolean) => true,
    /**
     * @zh 点击按钮时触发
     * @property {Boolean} open
     */
    afterOpenChange: (open: boolean) => true,
    /**
     * @zh 点击按钮时触发
     * @property {MouseEvent} ev
     */
    closed: (ev: MouseEvent) => true,
    /**
     * @zh 点击确定按钮
     */
    ok: () => true,
  });
  /**
   * @zh 标题
   * @slot title
   */
  /**
   * @zh 抽屉的页脚
   * @slot footer
   */
  /**
   * @zh 抽屉右上角的操作区域
   * @slot extra
   */
  const myProps = computed(() => ({
    ...props,
  }));

  const modelOpen = computed({
    get() {
      return props.open;
    },
    set(newValue) {
      emit('update:open', !!newValue);
    },
  });

  const handleClose = (ev: MouseEvent) => {
    emit('closed', ev);
  };

  const handleAfterOpenChange = (open: boolean) => {
    emit('afterOpenChange', open);
  };

  const handleOK = () => {
    emit('ok');
  };

  const handleCloseBtn = () => {
    if (props.beforeClose && props.beforeClose() === false) {
      return;
    }
    modelOpen.value = false;
  };
</script>

<style lang="less">
  @import './drawer';
</style>
