<template>
  <div :class="['lr-menu-vertical', { 'lr-menu-dark': theme === 'dark' }]" v-bind="containerProps">
    <div v-bind="wrapperProps">
      <lr-menu-item
        v-for="item in list"
        :key="item.data.value"
        :parent-actives="parentActives"
        :item="item.data"
        is-vertical
        @click="handleClick"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, inject, computed } from 'vue';
  import { useVirtualList } from '@vueuse/core';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('vmenu').name });

  const props = defineProps({
    /**
     * @zh 菜单数据。
     */
    menuList: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
  });

  const emit = defineEmits({
    /**
     * @zh 菜单项点击
     */
    click: (item: Record<string, any>) => true,
  });

  const { activeMenu, theme } = inject('jcode_menu_provide', {} as Record<string, any>);
  const color = [
    'var(--color-primary)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-error)',
    '#16c2c0',
    '#9154de',
  ];
  const myMenuList = computed(() => {
    props.menuList.forEach((item: Record<string, any>, i: number) => {
      item.color = color[i % color.length];
    });

    return props.menuList;
  });

  const parentActives = computed(() => {
    const list = activeMenu.value?.pid?.split('.') || [];

    return list;
  });

  const handleClick = (item: Record<string, any>) => {
    emit('click', item);
  };

  // 虚拟滚动
  const { list, containerProps, wrapperProps } = useVirtualList(myMenuList, {
    itemHeight: 96,
  });
</script>

<style lang="less">
  @import './menu';
</style>
