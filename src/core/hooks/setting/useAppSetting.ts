import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useAppStore, getNavThemeConfig } from '/@/core/store/modules/app';

export function useAppSetting() {
  const appStore = useAppStore();
  const { themeSetting } = storeToRefs(appStore);

  // 只有一个控制台：导航风格统一取账号保存的布局
  const getMemuType = computed(() => themeSetting.value.nav);

  const getTheme = computed(() => {
    const navTheme = getNavThemeConfig(getMemuType.value)?.themes[0];
    return {
      id: navTheme?.id || 'default',
      name: navTheme?.name || '',
      mode: 'light' as const,
      token: {} as Record<string, any>,
      jcodeToken: (navTheme?.themeToken || {}) as Record<string, any>,
      jcodeLogo: navTheme?.jcodeLogo || 'resource/logo-blue.png',
      menuTheme: navTheme?.menuTheme || 'light',
      menuMode: navTheme?.menuMode || 'inline',
      topMenuTheme: navTheme?.topMenuTheme || 'light',
      topMenuMode: navTheme?.topMenuMode || 'horizontal',
    };
  });

  return {
    getMemuType,
    getTheme,
  };
}
