<template>
  <div class="lr-block exception-page"
    ><a-result status="404" title="404" :sub-title="`${$t('抱歉')}，${$t('您访问的页面不存在')}。`">
      <template #extra>
        <lr-button type="primary" @click="handleClick">{{ $t('返回主页') }}</lr-button>
      </template>
    </a-result>
  </div>
</template>
<script lang="ts" setup>
  import { useGo } from '/@/core/hooks/usePage';
  import { useGlobSetting } from '/@/core/hooks/setting';

  const go = useGo();
  const { options } = useGlobSetting();
  const handleClick = () => {
    go(options.homePage.url, true);
  };
</script>
<style lang="less" scoped>
  .exception-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-layout);
  }
</style>
