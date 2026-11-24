<template>
  <div
    :class="['lr-block', prefixCls]"
    :style="{ 'background-color': themeToken?.colorBgContainer }"
  >
    <div class="logo-wraper">
      <img class="logo" :src="logoImg" />
      <div class="logo-title" :style="{ color: themeToken?.colorText }">{{ $t(title) }}</div>
    </div>

    <lr-layout right="34%" :mid-min-width="600" hide-mid-when-narrow :right-move="false">
      <div class="banner-wraper" :style="{ 'background-color': themeToken?.colorBgLayout }">
        <div class="banner-gradient"></div>
        <LrLoginBgSvg class="banner-svg" />
        <div class="banner-title" :style="{ color: themeToken?.colorTextSecondary }">{{
          `AI ${$t('赋能低代码')}，${$t('对话即开发')}，${$t('智能构建全业务场景')}`
        }}</div>
        <div class="banner-desc" :style="{ color: themeToken?.colorTextSecondary }">{{
          `${$t('全链路')} AI ${$t('辅助生成')}，${$t('从需求到应用一键达成')}，${$t('让企业数字化触手可及')}`
        }}</div>
      </div>

      <template #right>
        <div class="form-wraper">
          <div class="form">
            <div class="form-title-wraper">
              <div
                class="form-title"
                :style="{ 'font-size': '32px', color: themeToken.colorText }"
                >{{ `${$t('欢迎回来')} 👋🏻 ` }}</div
              >
              <div class="form-subtitle mt-8px" :style="{ color: themeToken.colorTextTertiary }">{{
                $t('请输入账户信息以开始设计您的应用')
              }}</div>
            </div>

            <lr-c-schema-form style="padding: 0" ref="refForm" @click="handleFormClick" />
          </div>
          <div class="copyright" :style="{ color: themeToken.colorTextTertiary }"
            >Copyright © {{ copyrightYear }} {{ $t(companyName) }}{{ $t('出品') }}</div
          >
        </div>
      </template>
    </lr-layout>

    <div class="setting-wraper">
      <lr-language-type />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { inject, ref, unref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useForm } from '/@/core/hooks/useForm';
  import { useUserStore } from '/@/core/store/organization/user';
  import { router } from '/@/core/router';
  import LrLoginBgSvg from '../../components/lrLoginBgSvg/index.vue';
  import { t } from '@/core/locales/setupI18n';

  const route = useRoute();
  const { urlPrefix, options } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-login`;

  const title = options.title;
  const companyName = options.company;
  const copyrightYear = options.copyrightYear;

  // options.params.isTenant

  const userStore = useUserStore();

  const refForm = ref();
  const { validateForm, setFormItemProps, getFormData } = useForm(refForm, {
    schemas: [
      {
        id: 'account',
        type: 'input',
        config: {
          size: 'large',
          // defaultValue: 'System',
          preIcon: { name: 'ant-design:user-outlined' },
        },
        rule: [
          {
            required: true,
            message: options.params.isTenant ? '请输入租户号@账号' : `${t('请输入帐号')}!`,
          },
        ],
      },
      {
        id: 'password',
        type: 'password',
        config: {
          size: 'large',
          // defaultValue: 'jcode20221125@!',
          preIcon: { name: 'ant-design:lock-outlined' },
        },
        rule: [{ required: true, message: `${t('请输入密码')}!` }],
      },
      {
        id: 'captcha',
        type: 'sliderCaptcha',
        // config: { label: '验证', notLabel: true },
        rule: [{ required: true, message: t('请先完成验证') }],
      },
      {
        id: 'loginBtn',
        type: 'button',
        config: {
          label: '登录',
          size: 'large',
          type: 'primary',
          block: true,
          mt: '32px',
          htmlType: 'submit',
        },
      },
    ],
  });

  const handleFormClick = async (id: string) => {
    if (id === 'loginBtn') {
      setFormItemProps(id, { loading: true });
      if (await validateForm()) {
        const formData = getFormData(false);

        const res = await userStore.login(formData);
        if (res) {
          const redirect = (route.query.redirect as string) || route.redirectedFrom?.fullPath;
          if (redirect) {
            await router.replace(redirect);
          } else {
            await router.replace(options.homePage.url);
          }
        }
      }
      setFormItemProps(id, { loading: false });
    }
  };

  // 主题
  const { themeToken, themeDark } = inject('jcode_app_provide', {} as Record<string, any>);

  const logoImg = computed(() =>
    unref(themeDark)
      ? `${urlPrefix}${options.loginPage.darkLogo}`
      : `${urlPrefix}${options.loginPage.logo}`,
  );
</script>
<style lang="less" scoped>
  @login-prefix-cls: ~'@{namespace}-login';
  .@{login-prefix-cls} {
    display: flex;
    position: relative;
    overflow: hidden;
    background: #fff;

    .logo-wraper {
      display: flex;
      position: absolute;
      top: 24px;
      left: 24px;
      align-items: center;
      height: 42px;
    }

    .logo {
      height: 100%;
      margin-right: 8px;
    }

    .logo-title {
      font-size: 24px;
    }

    .banner-wraper {
      display: flex;
      position: relative;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      overflow: hidden;
    }

    .banner-gradient {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(154deg, #07070915 30%, #bedaff 48%, #07070915 64%);
      filter: blur(100px);
    }

    .banner-svg {
      display: block;
      position: relative;
      z-index: 1;
      width: 40%;
      max-width: 480px;
    }

    .banner-title {
      position: relative;
      z-index: 1;
      margin-top: 16px;
      font-size: 24px;
    }

    .banner-desc {
      position: relative;
      z-index: 1;
      margin-top: 8px;
      font-size: 14px;
    }

    .form-wraper {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding-top: 64px;
      padding-bottom: 88px;
    }

    .form {
      position: relative;
      width: 80%;
      max-width: 400px;
    }

    .form-title-wraper {
      margin-bottom: 24px;
    }

    .form-title {
      font-size: 36px;
      font-weight: 600;
      line-height: 44px;
    }

    .form-subtitle {
      font-size: 14px;
    }

    .copyright {
      position: absolute;
      bottom: 8px;
      left: 0;
      width: 100%;
      font-size: 12px;
      text-align: center;
    }

    .setting-wraper {
      display: flex;
      position: absolute;
      top: 32px;
      right: 16px;
      align-items: center;
    }
  }
</style>
