<template>
  <a-tooltip v-if="collapsed && !item.hasChildren" placement="right">
    <template #title>
      <span>{{ $t(item.label) }}</span>
    </template>
    <div :class="['lr-menu-item', { collapsed: collapsed }]" @click.stop="handleClick(item)">
      <div
        :class="[
          'lr-menu-item-content',
          { active: item.active, 'p-active': parentActives.includes(item.value) },
        ]"
        :style="{ 'padding-left': `${item.indent * 16 + 16}px` }"
      >
        <lr-icon v-if="item.icon" :icon="item.icon" class="lr-menu-item-icon" />
        <div class="lr-menu-item-label">{{ $t(item.label) }}</div>
        <div v-if="item.hasChildren" :class="['lr-menu-item-arrow', { open: item.open }]"></div>
      </div>
    </div>
  </a-tooltip>
  <a-popover
    v-else-if="(collapsed || isSub || isHorizontal || isVertical) && item.hasChildren"
    :placement="isHorizontal ? 'bottomLeft' : 'rightTop'"
    :arrow="false"
    destroy-tooltip-on-hide
    auto-adjust-overflow
    overlay-class-name="lr-sub-menu"
  >
    <template #content>
      <lr-sub-menu :p-id="item.value" @click="handleClick" />
    </template>
    <div :class="['lr-menu-item', { collapsed: collapsed }]">
      <div
        :class="[
          'lr-menu-item-content',
          { active: item.active, 'p-active': parentActives.includes(item.value) },
        ]"
        :style="{ 'padding-left': `${item.indent * 16 + 16}px` }"
      >
        <lr-icon
          v-if="item.icon"
          :icon="item.icon"
          :style="{
            'margin-right': item.label ? '4px' : 0,
            'background-color': isVertical ? item.color : 'transparent',
          }"
          class="lr-menu-item-icon"
        />
        <div class="lr-menu-item-label">{{ $t(item.label) }}</div>
        <div
          v-if="item.hasChildren && !isHorizontal && !isVertical"
          :class="['lr-menu-item-arrow', 'sub']"
        ></div>
      </div>
    </div>
  </a-popover>

  <div
    v-else
    :class="['lr-menu-item', { collapsed: collapsed, sub: item.indent > 0 }]"
    @click.stop="handleClick(item)"
  >
    <div
      :class="[
        'lr-menu-item-content',
        { active: item.active, 'p-active': parentActives.includes(item.value) },
      ]"
      :style="{ 'padding-left': `${item.indent * 16 + 16}px` }"
    >
      <lr-icon
        v-if="item.icon"
        :icon="item.icon"
        class="lr-menu-item-icon"
        :style="{
          'margin-right': item.label ? '4px' : 0,
          'background-color': isVertical ? item.color : 'transparent',
        }"
      />
      <div class="lr-menu-item-label">{{ $t(item.label) }}</div>
      <div v-if="item.hasChildren" :class="['lr-menu-item-arrow', { open: item.open }]"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('menuItem').name });

  defineProps({
    /**
     * @zh 菜单项数据
     */
    item: {
      type: Object as PropType<{
        value: string;
        label: string;
        icon?: string;
        hasChildren?: boolean;
        indent: number;
        open: boolean;
        active: boolean;
        color?: string;
      }>,
      default: () => ({}),
    },
    /**
     * @zh 当前激活的菜单项
     */
    parentActives: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    /**
     * @zh 是否折叠。
     */
    collapsed: Boolean,
    /**
     * @zh 是否子菜单。(弹层)
     */
    isSub: Boolean,
    /**
     * @zh 是否水平菜单。
     */
    isHorizontal: Boolean,
    /**
     * @zh 是否竖直弹窗菜单。
     */
    isVertical: Boolean,
  });

  const emit = defineEmits({
    /**
     * @zh 菜单项点击
     */
    click: (item: Record<string, any>) => true,
  });

  const handleClick = (item: Record<string, any>) => {
    emit('click', item);
  };
</script>

<style lang="less"></style>
