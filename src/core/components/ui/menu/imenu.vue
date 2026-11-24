<template>
  <div
    :class="['lr-menu', { collapsed: collapsed, 'lr-menu-dark': theme === 'dark' }]"
    v-bind="containerProps"
  >
    <div v-bind="wrapperProps">
      <lr-menu-item
        v-for="item in list"
        :key="item.data.value"
        :parent-actives="activeMenu?.pid?.split('.') || []"
        :item="item.data"
        @click="handleClick"
        :collapsed="collapsed"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, inject, computed } from 'vue';
  import { useVirtualList } from '@vueuse/core';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('imenu').name });

  const props = defineProps({
    /**
     * @zh 菜单数据。
     */
    menuList: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 是否折叠。
     */
    collapsed: Boolean,
  });

  const emit = defineEmits({
    /**
     * @zh 菜单项点击
     */
    click: (item: Record<string, any>) => true,
  });

  const { activeMenu, theme } = inject('jcode_menu_provide', {} as Record<string, any>);

  const handleClick = (item: Record<string, any>) => {
    emit('click', item);
  };

  const myMenuList = computed(() => props.menuList);

  // 虚拟滚动
  const { list, containerProps, wrapperProps } = useVirtualList(myMenuList, {
    itemHeight: 40,
  });
</script>
