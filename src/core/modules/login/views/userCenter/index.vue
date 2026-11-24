<template>
  <div class="lr-block lr-user-center" style="padding: 8px">
    <div
      class="lr-block"
      style="overflow: hidden; border-radius: 4px; background-color: var(--color-bg-container)"
    >
      <a-tabs
        tab-position="left"
        :stretch="true"
        v-model:activeKey="activeKey"
        class="lr-block"
        size="large"
      >
        <a-tab-pane key="1" :tab="$t('基本信息')"><user-baseinfo /></a-tab-pane>
        <a-tab-pane key="2" :tab="$t('联系方式')"><Contact /></a-tab-pane>
        <a-tab-pane key="3" :tab="$t('我的头像')"><HeadForm /></a-tab-pane>
        <a-tab-pane key="4" :tab="$t('修改密码')"><Password /></a-tab-pane>
        <a-tab-pane key="5" :tab="$t('主题设置')"><ThemeSetting /></a-tab-pane>
        <a-tab-pane key="6" :tab="$t('我的日志')"><Log /></a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import userBaseinfo from './baseinfo.vue';
  import Contact from './contact.vue';
  import HeadForm from './headForm.vue';
  import Log from './log.vue';
  import Password from './password.vue';
  import ThemeSetting from './theme.vue';

  const activeKey = ref('1');
</script>

<style lang="less" scope>
  .lr-user-center {
    .ant-tabs-content.ant-tabs-content-left {
      height: 100%;
    }

    .ant-tabs-left > .ant-tabs-nav .ant-tabs-tab {
      width: 180px;
    }

    .ant-tabs-left > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane {
      padding-left: 0;
    }
  }
</style>
