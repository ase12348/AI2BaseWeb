<template>
  <div :style="siderStyle" class="lr-block exception-page"
    ><a-result status="403" title="403" :sub-title="`${$t('抱歉')}，${$t('您无权访问此页面')}。`">
      <template #extra>
        <lr-button type="primary" @click="handleClick">{{ $t('返回主页') }}</lr-button>
      </template>
    </a-result>
  </div>
</template>
<script lang="ts" setup>
  import { inject, computed } from 'vue';
  import { useGo } from '/@/core/hooks/usePage';
  import { useGlobSetting } from '/@/core/hooks/setting';

  const go = useGo();
  const { options } = useGlobSetting();
  const handleClick = () => {
    go(options.homePage.url, true);
  };
  // 主题
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);
  const siderStyle = computed(() => ({
    backgroundColor: themeToken.value.colorBgLayout,
  }));
</script>
<style lang="less" scoped>
  .exception-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
