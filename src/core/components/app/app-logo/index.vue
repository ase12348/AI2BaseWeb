<template>
  <div :class="appLogoClass">
    <img class="logoImg" :src="logoSrc" alt="" />
    <div class="ml-4px truncate md:opacity-100" :class="titleClass">
      {{ titleText }}
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useAppSetting } from '/@/core/hooks/setting/useAppSetting';
  import { t } from '/@/core/locales/setupI18n';

  const { getTheme } = useAppSetting();
  const { title, urlPrefix, options } = useGlobSetting();

  // 只有一个控制台：标题固定为平台名称
  const titleText = computed(() => t(title));
  const logoSrc = computed(() => `${urlPrefix}${getTheme.value.jcodeLogo}`);

  const prefixCls = `${options.prefixCls}-app-logo`;
  const appLogoClass = computed(() => [prefixCls]);
  const titleClass = computed(() => [`${prefixCls}__title`]);
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-app-logo';

  .@{prefix-cls} {
    display: flex;
    position: relative;
    align-items: center;
    height: 100%;
    padding-left: 16px;
    transition: all 0.2s ease;

    .logoImg {
      height: 24px;
      object-fit: contain;
    }

    &__title {
      height: 24px;
      transition: all 0.5s;
      color: var(--jcode-color-logo-text);
      font-size: 20px;
      font-weight: 600;
      line-height: 24px;
    }
  }
</style>
