<template>
  <div class="lr-block exception-page"
    ><a-result status="500" title="500" :sub-title="`${$t('抱歉')}，${$t('服务器出错了')}。`">
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
