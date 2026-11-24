<template>
  <button
    :class="[
      'lr-button',
      {
        'lr-button-primary': type == 'primary',
        'lr-button-default': type == 'default',
        'lr-button-dashed': type == 'dashed',
        'lr-button-link': type == 'link',
        'lr-button-text': type == 'text',
        'lr-button-ghost': ghost == true,
        'lr-button-danger': danger == true,
        'lr-button-lg': size == 'large',
        'lr-button-sm': size == 'small',
        'lr-button-circle': shape == 'circle',
        'lr-button-round': shape == 'round',
        'lr-button-block': block == true,
        'lr-button-loading': isLoading == true,
        'lr-button-icon-only': iconOnly == true,
        'lr-button-compact': compact == true,
        'lr-button-last-compact-item': lastCompactItem == true,
        'lr-button-first-compact-item': firstCompactItem == true,
      },
    ]"
    ref="buttonNodeRef"
    :disabled="disabled"
    :type="htmlType"
    @click="handleClick"
  >
    <template v-if="isLoading">
      <lr-icon
        icon="ant-design:loading-outlined"
        :is-div="false"
        :size="size == 'large' ? 14 : 12"
        class="loading-spin lr-button-loading-icon"
      />
    </template>
    <template v-if="iconName">
      <lr-icon
        :icon="iconName"
        :is-div="!states.label && !notLabel"
        :class="{ 'lr-button-icon': states.label && !notLabel }"
      />
    </template>
    <slot name="icon" v-if="!iconName"></slot>
    <slot v-if="!notLabel">
      <span>{{ $t(states.label || '') }}</span>
    </slot>
    <slot name="iconAfter"></slot>
  </button>
</template>

<script lang="ts" setup>
  import { PropType, shallowRef, VNode, computed, watch, ref, useSlots, Slots } from 'vue';
  import { createNamespace } from '../utils/components';
  import { isNullOrEmpty } from '../utils/is';

  defineOptions({ name: createNamespace('button').name });

  const props = defineProps({
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
     * @zh 设置按钮形状
     * @defaultValue 'default'
     */
    shape: {
      type: String as PropType<'default' | 'circle' | 'round'>,
    },
    /**
     * @zh 幽灵属性，使按钮背景透明
     * @defaultValue false
     */
    ghost: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 按钮不可用状态。
     * @defaultValue false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 设置危险按钮
     * @defaultValue false
     */
    danger: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 将按钮宽度调整为其父宽度的选项
     * @defaultValue false
     */
    block: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 设置按钮载入状态
     * @defaultValue false
     */
    loading: {
      type: [Boolean, Object] as PropType<boolean | { delay?: number }>,
      default: (): boolean | { delay?: number } => false,
    },
    /**
     * @zh 图标
     */
    icon: {
      type: Object as PropType<VNode>,
    },
    iconName: {
      type: String,
      default: '',
    },

    /**
     * @zh 点击跳转的地址，指定此属性 button 的行为和 a 链接一致
     */
    href: {
      type: String,
    },
    /**
     * @zh 相当于 a 链接的 target 属性，href 存在时生效
     */
    target: {
      type: String,
    },
    /**
     * @zh 设置 button 原生的 type 值，可选值请参考 HTML 标准
     */
    htmlType: {
      type: String as PropType<'button' | 'submit' | 'reset' | undefined>,
      default: 'button',
    },
    /**
     * @zh 按钮内容
     */
    label: {
      type: String,
    },
    /**
     * @zh 是否不要文字
     */
    notLabel: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否紧凑模式
     */
    compact: Boolean,
    lastCompactItem: Boolean,
    firstCompactItem: Boolean,
  });

  const emit = defineEmits({
    /**
     * @zh 点击按钮时触发
     * @property {MouseEvent} ev
     */
    click: (ev: MouseEvent) => true,
  });

  /**
   * @zh 图标
   * @slot icon
   */
  const states = computed(() => ({
    ...props,
  }));

  const handleClick = (ev: MouseEvent) => {
    if (!isLoading.value) {
      emit('click', ev);
      if (props.href) {
        window.open(props.href, props.target ? props.target : '_self');
      }
    }
  };

  const buttonNodeRef = shallowRef<any>(null);
  const innerFocus = () => {
    buttonNodeRef.value?.focus();
  };
  const innerBlur = () => {
    buttonNodeRef.value?.blur();
  };

  // 获取 slots 对象
  const slots = useSlots();

  const isLrIcon = (vnode: any): boolean => {
    if (!vnode) return false;
    if (vnode.type && typeof vnode.type === 'object' && vnode.type.name === 'LrIcon') {
      return true;
    }
    if (vnode.children && Array.isArray(vnode.children)) {
      return vnode.children.every((child: any) => isLrIcon(child as VNode));
    }
    return false;
  };
  // 判断所有 slot 是否仅包含一个 lr-icon 组件
  const hasOnlyLrIconInAllSlots = computed(() => {
    const slotNames = Object.keys(slots) as (keyof Slots)[];
    if (!hasAnySlotContent.value) {
      return false;
    }

    return slotNames.every((slotName) => {
      const slotContent = slots[slotName]?.();
      if (!slotContent || slotContent.length === 0) {
        return true; // 空插槽视为符合条件
      }
      return slotContent.every(isLrIcon);
    });
  });

  // 判断所有 slot 是否有内容
  const hasAnySlotContent = computed(() => {
    const slotNames = Object.keys(slots);
    return slotNames.some((slotName) => {
      const slotContent = slots[slotName]?.();
      return !!slotContent && slotContent.length > 0;
    });
  });

  const iconOnly = computed(() => {
    const condition1 = hasOnlyLrIconInAllSlots.value && hasAnySlotContent.value;
    const condition2 = !!props.iconName && !hasAnySlotContent.value;
    const condition3 = !!props.icon && !hasAnySlotContent.value;
    const condition4 = isLoading.value && !hasAnySlotContent.value;

    const trueCount = [condition1, condition2, condition3, condition4].filter(Boolean).length;
    return (props.notLabel || !props.label) && trueCount === 1;
  });

  const isLoading = ref(false);

  watch(
    () => props.loading,
    (newValue) => {
      if (typeof newValue === 'boolean') {
        isLoading.value = newValue;
      } else if (!isNullOrEmpty(newValue?.delay)) {
        const timeoutId = setTimeout(() => {
          isLoading.value = true;
        }, newValue.delay);

        return () => clearTimeout(timeoutId);
      } else {
        isLoading.value = false;
      }
    },
    { immediate: true },
  );

  /**
   * @zh 移除焦点
   * @public
   */
  function focus() {
    innerFocus();
  }
  /**
   * @zh 获取焦点
   * @public
   */
  function blur() {
    innerBlur();
  }

  defineExpose({ focus, blur });
</script>

<style lang="less">
  @import './button';
</style>
