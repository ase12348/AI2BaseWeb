<template>
  <div ref="menuRef" :class="['lr-menu-horizontal', { 'lr-menu-dark': theme === 'dark' }]">
    <lr-menu-item
      v-for="item in myMenuList"
      :key="item.value"
      :parent-actives="parentActives"
      :item="item"
      is-horizontal
      @click="handleClick"
    />
  </div>
</template>

<script lang="ts" setup>
  import { PropType, inject, computed, ref, onMounted, provide } from 'vue';
  import { getTextWidth } from '../utils/method';

  defineOptions({ name: 'LrHmenu' });

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

  const menuRef = ref();
  const width = ref(0);

  const resizeObserver = new ResizeObserver(() => {
    if (menuRef.value) {
      width.value = menuRef.value.offsetWidth;
    }
  });
  onMounted(() => {
    resizeObserver.observe(menuRef.value);
  });

  const myMenuList = computed(() => {
    const res: Record<string, any>[] = [];

    let nowWidth = 0;
    let index = 0;
    const len = props.menuList.length;
    props.menuList.forEach((item) => {
      index++;
      const iconSpace = item.icon ? 16 + 4 : 0;
      const itemWidth = (getTextWidth(item.label) || 0) + 32 + 16 + iconSpace;
      nowWidth += itemWidth;
      if (index === len && nowWidth <= width.value) {
        res.push(item);
      } else if (index < len && nowWidth + 56 <= width.value) {
        res.push(item);
      }
    });

    if (res.length < props.menuList.length) {
      res.push({
        value: 'moreId',
        icon: 'ant-design:more-outlined',
        label: '',
        hasChildren: true,
        indent: 0,
        open: false,
        active: false,
      });
    }

    return res;
  });

  const getHMoreMenus = computed(() => {
    const res: Record<string, any>[] = [];

    let index = 0;
    const len = myMenuList.value.length;
    props.menuList.forEach((item) => {
      index++;
      if (index >= len) {
        res.push(item);
      }
    });

    return res;
  });

  const parentActives = computed(() => {
    const list = activeMenu.value?.pid?.split('.') || [];
    if (
      (list.length > 1 && getHMoreMenus.value.findIndex((t) => t.value === list[1]) > -1) ||
      getHMoreMenus.value.findIndex((t) => t.value === activeMenu.value?.value) > -1
    ) {
      list.push('moreId');
    }

    return list;
  });

  const handleClick = (item: Record<string, any>) => {
    emit('click', item);
  };

  provide('jcode_h_menu_provide', {
    getHMoreMenus,
  });
</script>

<style lang="less">
  @import './menu';
</style>
