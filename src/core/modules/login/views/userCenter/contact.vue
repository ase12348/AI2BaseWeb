<template>
  <div class="lr-block">
    <a-form
      class="mt-16px"
      :colon="false"
      :label-col="{ style: { width: '80px' } }"
      :wrapper-col="{ span: 14 }"
    >
      <a-form-item :label="$t('手机')">
        <a-input :value="loginInfo.f_Mobile" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('电话')">
        <a-input :value="loginInfo.f_Telephone" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('邮箱')">
        <a-input :value="loginInfo.f_Email" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('微信')">
        <a-input :value="loginInfo.f_WeChat" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('QQ')">
        <a-input :value="loginInfo.f_OICQ" :readonly="true" />
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useUserStore } from '/@/core/store/organization/user';

  const userStore = useUserStore();
  const loginInfo = computed(() => userStore.getLoginInfo);
</script>
