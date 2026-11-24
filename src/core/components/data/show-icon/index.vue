<template>
  <div class="jcode-show-icon" :style="{ height: '100%', width: `${size + 32}px` }">
    <div class="jcode-show-icon-body" :style="{ height: `${size}px` }">
      <lr-icon v-if="updateFlag" :size="size" :icon="icon || 'jcode:show-demo-icon-demo'" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { watch, ref, nextTick } from 'vue';
  import { addIcon } from '@/core/utils/jcode';

  const props = defineProps({
    /**
     * 尺寸
     */
    size: {
      type: Number,
      default: 100,
    },
    /**
     * 图标
     */
    icon: {
      type: String,
    },
    /**
     * svg 数据
     */
    svg: {
      type: String,
    },
    width: Number,
    height: Number,
  });

  const updateFlag = ref(false);

  const updateIcon = () => {
    if (props.icon) {
      return;
    }
    updateFlag.value = false;

    addIcon('jcode:show-demo-icon-demo', {
      body: props.svg,
      width: props.width || 1024,
      height: props.height || 1024,
    });

    nextTick(() => {
      updateFlag.value = true;
    });
  };

  watch(
    () => props.svg,
    () => {
      updateIcon();
    },
    { immediate: true },
  );
  watch(
    () => props.width,
    () => {
      updateIcon();
    },
  );
  watch(
    () => props.height,
    () => {
      updateIcon();
    },
  );
</script>
<style lang="less" scoped>
  .jcode-show-icon {
    display: flex;
    position: relative;
    padding: 0 16px;

    &-body {
      position: relative;
      width: 100%;
      border: 1px solid var(--color-border);
      background: var(--color-bg-container);
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="rgba(0,0,0,0.1)" d="M0 0h16v16H0zm16 16h16v16H16z"/><path fill="rgba(255,255,255,0.1)" d="M0 16h16v16H0zM16 0h16v16H16z"/></svg>');
      background-size: 8px;
    }
  }
</style>
