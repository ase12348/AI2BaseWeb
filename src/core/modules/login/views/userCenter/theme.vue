<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}-tip`">
      {{ $t('主题设置与当前账号绑定，保存后重新登录或在其他设备登录同样生效') }}
    </div>

    <div :class="`${prefixCls}-section`">
      <lr-text content="导航风格" :size="16" weight="bold" />
      <div :class="`${prefixCls}-hint`">
        {{ $t('设置整个平台的导航布局风格') }}
      </div>
      <div :class="`${prefixCls}-checkbox`" class="mt-16px">
        <div v-for="item in navThemes" :key="item.nav" :class="`${prefixCls}-nav-wrap`">
          <div
            :class="[
              `${prefixCls}-nav-item`,
              item.nav,
              { 'is-active': themeSetting.nav === item.nav },
            ]"
            :style="navPreviewStyle"
            @click="handleNavClick(item.nav)"
          >
            <lr-icon
              v-if="themeSetting.nav === item.nav"
              :class="`${prefixCls}-icon`"
              icon="ant-design:check-outlined"
            />
          </div>
          <a-tooltip placement="top" :title="$t(item.desc)">
            <div :class="`${prefixCls}-nav-name`">
              <span>{{ $t(item.name) }}</span>
            </div>
          </a-tooltip>
        </div>
      </div>
    </div>

    <div :class="`${prefixCls}-section`">
      <lr-text content="背景风格" :size="16" weight="bold" />
      <div :class="`${prefixCls}-checkbox`" class="mt-16px">
        <a-tooltip
          v-for="item in colorTypeThemes"
          :key="item.colorType"
          placement="top"
          :title="$t(item.name)"
        >
          <div
            :class="`${prefixCls}-color-type-item`"
            :style="{ backgroundImage: item.bgImage }"
            @click="handleColorTypeClick(item.colorType)"
          >
            <lr-icon
              v-if="themeSetting.colorType === item.colorType"
              :class="`${prefixCls}-icon`"
              icon="ant-design:check-outlined"
            />
          </div>
        </a-tooltip>
      </div>
    </div>

    <div :class="`${prefixCls}-section`">
      <lr-text content="主题颜色" :size="16" weight="bold" />
      <div :class="`${prefixCls}-checkbox`" class="mt-16px">
        <div
          v-for="item in colorList"
          :key="item"
          :class="`${prefixCls}-theme-color`"
          :style="{ backgroundColor: themeColorHex[item] }"
          @click="handleColorClick(item)"
        >
          <lr-icon
            v-if="themeSetting.color === item"
            :class="`${prefixCls}-icon`"
            icon="ant-design:check-outlined"
          />
        </div>
      </div>
    </div>

    <div :class="`${prefixCls}-section`">
      <lr-text content="其它设置" :size="16" weight="bold" />
      <a-form
        class="mt-16px"
        :label-col="{ style: { width: '100px' } }"
        label-align="right"
        :wrapper-col="{ span: 10 }"
      >
        <a-form-item :label="$t('菜单栏宽度')">
          <a-input-number
            v-model:value="sideWidth"
            :placeholder="$t('请输入')"
            :disabled="!['side', 'mix'].includes(themeSetting.nav)"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item :label="$t('顶部条高度')">
          <a-input-number
            v-model:value="headerHeight"
            :min="48"
            :max="72"
            :placeholder="$t('请输入')"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item :label="$t('菜单选项卡')">
          <a-switch v-model:checked="showTabs" />
        </a-form-item>
        <a-form-item :label="$t('次级菜单图标')">
          <a-switch v-model:checked="showIcon" />
        </a-form-item>
      </a-form>
    </div>

    <div :class="`${prefixCls}-footer`">
      <lr-button :label="$t('重置')" :loading="reseting" @click="handleReset" />
      <lr-button type="primary" :label="$t('保存')" :loading="saving" @click="handleSave" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';

  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useMessage } from '/@/core/hooks/useMessage';
  import { useAppStore, getColorTypeConfig, themeColorHex } from '/@/core/store/modules/app';
  import navThemes from '/@/config/theme';
  import colorTypeThemes from '/@/config/themeColor';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();
  const { options } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-user-center-theme`;

  const appStore = useAppStore();
  const themeSetting = appStore.themeSetting;

  // 主题色可选列表
  const colorList = ['blue', 'red', 'orange', 'yellow', 'cyan', 'green', 'blue2', 'purple'];

  // 保存按钮载入状态，避免请求过程中重复点击
  const saving = ref(false);
  // 重置按钮载入状态，避免拉取服务端配置过程中重复点击
  const reseting = ref(false);

  // 导航预览使用当前背景图
  const navPreviewStyle = computed(() => ({
    backgroundImage: getColorTypeConfig(themeSetting.colorType)?.bgImage || 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }));

  const sideWidth = computed({
    get: () => themeSetting.sideWidth,
    set: (val) => appStore.setThemeSetting({ sideWidth: val }),
  });
  const headerHeight = computed({
    get: () => themeSetting.headerHeight,
    set: (val) => appStore.setThemeSetting({ headerHeight: val }),
  });
  const showTabs = computed({
    get: () => themeSetting.showTabs,
    set: (val) => appStore.setThemeSetting({ showTabs: val }),
  });
  const showIcon = computed({
    get: () => themeSetting.showIcon,
    set: (val) => appStore.setThemeSetting({ showIcon: val }),
  });

  const handleNavClick = (nav: string) => {
    appStore.setThemeSetting({ nav });
  };

  const handleColorTypeClick = (colorType: string) => {
    appStore.setThemeSetting({ colorType });
  };
  const handleColorClick = (color: string) => {
    appStore.setThemeSetting({ color });
  };

  // 放弃未保存的改动，还原为当前账号已保存的主题
  const handleReset = async () => {
    reseting.value = true;
    try {
      await appStore.resetThemeSetting();
      success(t('已还原为当前账号保存的主题'));
    } finally {
      reseting.value = false;
    }
  };

  // 保存到当前账号，成功后其他设备登录同样生效
  const handleSave = async () => {
    saving.value = true;
    try {
      if (await appStore.saveThemeSetting()) {
        success(t('保存成功'));
      }
    } finally {
      saving.value = false;
    }
  };

  onMounted(() => {
    // 登录后路由守卫已拉取过当前账号的主题，这里只做兜底
    appStore.loadThemeSetting();
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-user-center-theme';

  .@{prefix-cls} {
    padding: 8px 16px 24px;

    &-tip {
      margin-bottom: 8px;
      padding: 8px 12px;
      border-radius: 4px;
      background-color: var(--color-fill-quaternary);
      color: var(--color-text-secondary);
      font-size: 13px;
    }

    &-section {
      margin-top: 16px;
    }

    &-hint {
      margin-top: 4px;
      color: var(--color-text-secondary);
      font-size: 13px;
    }

    &-checkbox {
      display: flex;
      flex-wrap: wrap;
    }

    &-nav-wrap {
      margin-right: 32px;
      margin-bottom: 24px;
    }

    &-nav-item {
      position: relative;
      width: 96px;
      min-width: 96px;
      height: 60px;
      overflow: hidden;
      border: 2px solid transparent;
      border-radius: 4px;
      background-color: #f5f5f5;
      background-position: center;
      background-size: cover;
      box-shadow: 2px 2px 7px 0 rgb(0 0 0 / 12%);
      cursor: pointer;

      &.is-active {
        border-color: var(--color-primary);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 16px;
        height: 100%;
        background-color: rgb(255 255 255 / 40%);
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 8px;
        background-color: rgb(255 255 255 / 40%);
      }

      &.side::before {
        background-color: rgb(0 0 0 / 35%);
      }

      &.mix::before {
        background-color: rgb(0 0 0 / 35%);
      }

      &.mix::after {
        background-color: rgb(0 0 0 / 35%);
      }

      &.top::after {
        background-color: rgb(0 0 0 / 35%);
      }

      &.top::before {
        display: none;
      }

      &.side2::before {
        width: 8px;
        background-color: rgb(0 0 0 / 35%);
      }

      &.side2::after {
        display: none;
      }
    }

    &-nav-name {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 8px;
      font-size: 13px;
      cursor: pointer;
    }

    &-color-type-item {
      position: relative;
      width: 64px;
      min-width: 64px;
      height: 40px;
      margin-right: 32px;
      margin-bottom: 32px;
      overflow: hidden;
      background-color: #f5f5f5;
      background-position: center;
      background-size: cover;
      box-shadow: 2px 2px 7px 0 rgb(0 0 0 / 12%);
      cursor: pointer;
    }

    &-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 18px;
      pointer-events: none;
      filter: drop-shadow(0 1px 2px rgb(0 0 0 / 60%));
    }

    &-theme-color {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      width: 24px;
      min-width: 24px;
      height: 24px;
      margin-right: 4px;
      overflow: hidden;
      cursor: pointer;
    }

    &-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border-secondary);
    }
  }
</style>
