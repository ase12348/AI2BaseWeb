<template>
  <div
    :class="['lr-sub-menu-content', { 'lr-menu-dark': theme === 'dark' }]"
    style="max-height: calc(100vh - 80px); border-radius: 8px"
    v-bind="containerProps"
  >
    <div v-bind="wrapperProps">
      <lr-menu-item
        v-for="menuItem in list"
        :key="menuItem.data.value"
        :parent-actives="activeMenu?.pid?.split('.') || []"
        :item="menuItem.data"
        is-sub
        @click="handleClick"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, inject } from 'vue';
  import { useVirtualList } from '@vueuse/core';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('subMenu').name });

  const props = defineProps({
    /**
     * @zh 父级ID
     */
    pId: {
      type: String,
    },
  });

  const emit = defineEmits({
    /**
     * @zh 菜单项点击
     */
    click: (item: Record<string, any>) => true,
  });

  const { getMenuMap, toArray, activeMenu, theme } = inject(
    'jcode_menu_provide',
    {} as Record<string, any>,
  );

  const { getHMoreMenus } = inject('jcode_h_menu_provide', {} as Record<string, any>);

  const menus = ref<Record<string, any>[]>([]);
  if (props.pId === 'moreId') {
    menus.value = getHMoreMenus.value;
  } else {
    menus.value = toArray(getMenuMap()[props.pId || ''] || [], []);
  }

  const handleClick = (item: Record<string, any>) => {
    const activeItem = menus.value.find((t) => t.active);
    if (activeItem?.value === item.value) return;
    if (activeItem) {
      activeItem.active = false;
    }
    emit('click', item);
  };

  // 虚拟滚动
  const { list, containerProps, wrapperProps } = useVirtualList(menus, {
    itemHeight: 40,
  });
</script>

<style lang="less"></style>
