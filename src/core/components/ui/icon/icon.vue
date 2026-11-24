<template>
  <div v-if="isDiv" class="anticon lr-icon" :style="{ height: `${size}px` }">
    <Iconify v-bind="myProps" :height="`${size}px`" :width="`${size}px`" mode="svg" />
  </div>
  <span v-else class="anticon">
    <Iconify v-bind="myProps" :height="`${size}px`" :width="`${size}px`" mode="svg" />
  </span>
</template>

<script lang="ts" setup>
  import { PropType, computed } from 'vue';
  import { Icon as Iconify, getIcon } from '@iconify/vue';

  defineOptions({ name: 'LrIcon' });

  const props = defineProps({
    /**
     * @zh 图标名称
     */
    icon: {
      type: String as PropType<string>,
      required: true,
    },
    /**
     * @zh 颜色。
     */
    color: {
      type: String as PropType<string>,
    },
    /**
     * @zh 是否反转 horizontal,vertical
     */
    flip: {
      type: String as PropType<string>,
    },
    /**
     * @zh 大小
     */
    size: {
      type: Number as PropType<number>,
      default: 16,
    },
    /**
     * @zh 是否需要isDiv
     */
    isDiv: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  });
  const iconData = computed(() => {
    const { icon } = props;
    if (icon.indexOf(':') === -1) {
      return `jcode:${props.icon}`;
    }
    const iconList = icon.split(':');
    const myIcon = `jcode:${iconList[1]}`;
    if (getIcon(myIcon) != null) {
      return myIcon;
    }
    return icon;
  });
  const myProps = computed(() => ({
    ...props,
    icon: iconData.value,
  }));
</script>

<style lang="less">
  @import './icon';
</style>
