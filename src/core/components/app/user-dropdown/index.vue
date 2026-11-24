<template>
  <div>
    <a-config-provider
      :theme="{
        components: {
          Button: {
            colorBgTextHover: themeToken.jcode_colorBgBtnHeader,
          },
        },
      }"
    >
      <a-dropdown :class="prefixCls">
        <lr-button class="jcode-header-btn" type="text"
          ><a-avatar
            class="header-avatar"
            :style="{ 'background-color': themeToken.jcode_colorAvatarHeader }"
            :size="24"
            :src="avatar"
            >{{ avatarName.toUpperCase() }}</a-avatar
          ><span class="ml-4px" :style="{ color: themeToken.jcode_colorTextBtnHeader }">{{
            userName
          }}</span></lr-button
        >

        <template #overlay>
          <a-menu :selectedKeys="[]">
            <a-menu-item>
              <span :style="{ color: themeToken.colorTextTertiary }"
                >{{ $t('帐号') }}:{{ account }}</span
              >
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item @click="handleGo">
              <span>{{ $t('个人中心') }}</span>
            </a-menu-item>
            <a-menu-item @click="handleRemoveSystemCache">
              <span>{{ $t('清空缓存') }}</span>
            </a-menu-item>
            <a-menu-item @click="handleFramework">
              <span>{{ $t('关于框架') }}</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item @click="handleLogout">
              <span>{{ $t('退出登录') }}</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <lr-modal
        v-model:visible="frameworkVisible"
        :title="$t('关于框架')"
        :height="280"
        width="560px"
        :hasBtns="false"
      >
        <div class="lr-block jcode-framework-info">
          <img class="jcode-framework-info__img" :src="`${urlPrefix}img/admin/about.png`" />
          <div class="jcode-framework-info__content">
            <div class="jcode-framework-info__title">
              {{ options.title }}
            </div>
            <div class="jcode-framework-info__version">
              {{ $t('版本') }}:{{ options.version
              }}{{ options.edition ? ' ' + options.edition : '' }}</div
            >
            <div>
              <!-- <lr-button @click="openLerun" type="primary">{{ $t('极简搭官网') }}</lr-button> -->
            </div>
            <div class="jcode-framework-info__footer">
              <div>Copyright © {{ options.copyrightYear }}</div>
              <div>{{ options.company }}</div>
            </div>
          </div>
        </div>
      </lr-modal>
    </a-config-provider>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject, ref } from 'vue';
  import { useGo } from '/@/core/hooks/usePage';
  import { useUserStore } from '/@/core/store/organization/user';
  import { useMessage } from '/@/core/hooks/useMessage';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { api as loginApi } from '/@/core/modules/login/api/index';
  import { t } from '@/core/locales/setupI18n';

  const { options, urlPrefix, apiUrl } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-header-user`;

  const userStore = useUserStore();

  const avatar = computed(() => {
    return userStore.getLoginInfo.avatar
      ? `${apiUrl}/system/annexesfile/${userStore.getLoginInfo.avatar}?token=${userStore.getToken}`
      : ``;
  });
  const avatarName = computed(() => {
    const account = userStore.getLoginInfo.account || '';
    return account.length > 2 ? account.slice(0, 2) : account;
  });

  const userName = computed(() => userStore.getLoginInfo.name || '');
  const account = computed(() => userStore.getLoginInfo.account || '');

  // 方法
  const { createConfirm } = useMessage();
  const go = useGo();
  const handleGo = () => {
    go('/login/userCenter');
  };
  const handleRemoveSystemCache = () => {
    createConfirm({
      title: t('提示'),
      iconType: 'warning',
      content: `${t('您确定要清空系统缓存吗')}?`,
      onOk: async () => {
        await loginApi.removeCache();
        location.reload();
      },
    });
  };
  const handleLogout = () => {
    createConfirm({
      title: t('提示'),
      iconType: 'warning',
      content: `${t('您确定要退出当前系统吗')}?`,
      onOk: async () => {
        await userStore.logout();
      },
    });
  };

  const frameworkVisible = ref(false);
  const handleFramework = () => {
    frameworkVisible.value = true;
  };
  // const openLerun = () => {};

  // 主题设置
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-user';

  .@{prefix-cls} {
    .ant-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      cursor: pointer;
    }

    .header-avatar {
      border: 0 !important;
      font-size: 16px !important;
    }
  }

  .jcode-framework-info {
    position: relative;
    padding: 16px;

    &__img {
      position: absolute;
      top: -68px;
      left: -68px;
      height: 416px;
    }

    &__content {
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: 100%;
      padding: 60px 32px 30px 0;
      text-align: right;
    }

    &__title {
      color: #262626;
      font-size: 20px;
      line-height: 20px;
    }

    &__version {
      margin-top: 14px;
      color: #8c8c8c;
      font-size: 14px;
      line-height: 20px;
    }

    &__footer {
      margin-top: 40px;
      color: #8c8c8c;
      font-size: 12px;
    }

    .el-button--primary {
      width: 155px;
      margin-top: 32px;
      padding: 9px 0;
      border-radius: 2px;
      font-size: 12px;
    }
  }
</style>
