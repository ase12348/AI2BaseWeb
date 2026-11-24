<template>
  <lr-imenu
    v-if="mode === 'inline'"
    :menu-list="showMenuList"
    :collapsed="collapsed"
    @click="handleClick"
  />
  <lr-hmenu v-else-if="mode === 'horizontal'" :menu-list="showMenuList" @click="handleClick" />
  <lr-vmenu v-else :menu-list="showMenuList" @click="handleClick" />
</template>
<script lang="ts" setup>
  import { computed, PropType, ref, watch, provide } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('menu').name });

  const props = defineProps({
    /**
     * @zh 菜单数据。
     */
    meuns: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 当前激活的菜单项。
     */
    activeId: String,
    /**
     * @zh 是否折叠。
     */
    collapsed: Boolean,
    /**
     * @zh 主题。
     */
    theme: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light',
    },
    mode: {
      type: String as PropType<'vertical' | 'horizontal' | 'inline'>,
      default: 'inline',
    },
  });

  const emit = defineEmits({
    click: (item: Record<string, any>) => true,
  });

  let menuMap: Record<string, any> = {};
  const myActiveId = ref('');
  myActiveId.value = props.activeId || '';

  const setArray = (list: any[], pid: string, data: any[], indent: number, openKeys?: string[]) => {
    data = data || [];
    for (let i = 0, len = data.length; i < len; i++) {
      const item = data[i];
      const newItem: Record<string, any> = {};
      newItem.pid = pid;
      newItem.indent = indent;

      if (myActiveId.value === item.value) {
        newItem.active = true;
      }

      Object.keys(item).forEach((key) => {
        if (key !== 'children') newItem[key] = item[key];
      });
      if (openKeys && openKeys.includes(item.value)) {
        newItem.open = true;
      }

      list.push(newItem);

      const children = item.children || [];
      if (children.length > 0) {
        newItem.hasChildren = true;
        if (!openKeys) {
          menuMap[newItem.value] = children;
        }
        if (!openKeys || (newItem.open && !props.collapsed)) {
          setArray(list, `${pid}.${newItem.value}`, children, indent + 1, openKeys);
        }
      }
    }
  };
  const toArray = (data: any[], openKeys?: string[]) => {
    const list: any[] = [];
    const indent = 0;
    setArray(list, '0', data, indent, openKeys);
    return list;
  };
  const showMenuList = ref<Record<string, any>[]>([]);
  let menuList: Record<string, any>[] = [];
  const init = () => {
    menuMap = {};
    menuList = toArray(props.meuns);
    const openKeys = [];
    if (myActiveId.value && props.mode === 'inline') {
      const activeItem = menuList.find((t) => t.value === myActiveId.value);
      if (activeItem) {
        openKeys.push(...activeItem.pid.split('.'));
      }
    }
    showMenuList.value = toArray(props.meuns, openKeys);
  };

  watch(
    () => props.meuns,
    () => {
      init();
    },
    {
      immediate: true,
    },
  );

  watch(
    () => props.mode,
    () => {
      init();
    },
  );

  const selectItem = () => {
    const old = showMenuList.value.find((t) => t.active);
    if (old?.value !== myActiveId.value) {
      const activeItem = menuList.find((t) => t.value === myActiveId.value);
      if (activeItem) {
        const openKeys = [];
        if (props.mode === 'inline') {
          openKeys.push(...activeItem.pid.split('.'));
        }

        showMenuList.value = toArray(props.meuns, openKeys);
      } else if (old) {
        // 目标页不在菜单表里（首页、个人中心这类非菜单页）：只摘掉旧高亮，
        // 不整表重建，免得把用户展开的目录一起收起来
        old.active = false;
      }
    }
  };

  const activeMenu = computed(() => menuList.find((t) => t.value === myActiveId.value));

  watch(
    () => props.activeId,
    () => {
      myActiveId.value = props.activeId || '';
      selectItem();
    },
  );

  watch(
    () => props.collapsed,
    () => {
      if (props.collapsed) {
        showMenuList.value = toArray(props.meuns, []);
      } else {
        const openKeys = [];
        if (myActiveId.value) {
          const activeItem = menuList.find((t) => t.value === myActiveId.value);
          if (activeItem) {
            openKeys.push(...activeItem.pid.split('.'));
          }
        }
        showMenuList.value = toArray(props.meuns, openKeys);
      }
    },
  );

  const myTheme = computed(() => props.theme);

  const handleClick = (item: Record<string, any>) => {
    if (item.hasChildren) {
      if (props.collapsed) return;
      const openKeys = [];
      openKeys.push(...item.pid.split('.'));
      if (!item.open) {
        openKeys.push(item.value);
      }
      showMenuList.value = toArray(props.meuns, openKeys);
    } else {
      const activeItem = showMenuList.value.find((t) => t.active);
      if (activeItem?.value === item.value) return;
      if (activeItem) {
        activeItem.active = false;
      }
      item.active = true;
      myActiveId.value = item.value;
      emit('click', item);
    }
  };

  provide('jcode_menu_provide', {
    getMenuMap: () => menuMap,
    toArray,
    activeMenu,
    theme: myTheme,
  });
</script>

<style lang="less">
  @import './menu';
</style>
