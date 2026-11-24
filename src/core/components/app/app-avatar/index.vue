<template>
  <span class="lr-app-avatar" :class="{ 'is-image': !!src }" :style="avatarStyle">
    <img v-if="src" class="lr-app-avatar__img" :src="src" alt="" />
    <template v-else>{{ text }}</template>
  </span>
</template>
<script lang="ts" setup>
  /**
   * 应用头像
   *
   * 应用设置了图标时显示图标；没有图标（纯在线新建的应用很常见）时用应用名首字生成默认图标，
   * 不再回退到平台 logo —— 否则切进应用后顶栏看起来还停在「控制台」。
   * 默认图标是方形 + 4px 圆角 + 蓝底白字，顶栏、切换器、切换遮罩与应用列表共用同一套样式。
   */
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      name?: string;
      code?: string;
      /** 应用图标地址；为空时渲染首字默认图标 */
      src?: string;
      /** 头像边长（px） */
      size?: number;
    }>(),
    { name: '', code: '', src: '', size: 24 },
  );

  /** 默认图标底色：统一蓝色，不按应用散列，保证同一平台里所有默认图标一致 */
  const DEFAULT_BG = '#1677ff';
  /** 方形图标的圆角 */
  const RADIUS_PX = 4;

  const text = computed(() => {
    const source = (props.name || props.code || '').trim();
    return source ? Array.from(source)[0].toUpperCase() : '?';
  });

  const avatarStyle = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    borderRadius: `${RADIUS_PX}px`,
    backgroundColor: props.src ? 'transparent' : DEFAULT_BG,
    fontSize: `${Math.max(10, Math.round(props.size * 0.45))}px`,
  }));
</script>
<style lang="less" scoped>
  .lr-app-avatar {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: #fff;
    font-weight: 600;
    line-height: 1;
    user-select: none;

    &__img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
</style>
