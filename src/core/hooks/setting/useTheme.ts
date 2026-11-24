import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { theme } from 'ant-design-vue';
import { useAppStore, resolveThemeToken, themeColorHex } from '/@/core/store/modules/app';

export function useTheme() {
  const appStore = useAppStore();
  const { themeSetting } = storeToRefs(appStore);
  const { compactAlgorithm } = theme;

  const themeConfig = computed(() => {
    const setting = themeSetting.value;
    const token: Record<string, any> = {
      // 主题色
      colorPrimary: themeColorHex[setting.color] || themeColorHex.blue,
      collapsedWidth: 56,
      colorTextMedium: 'rgba(0, 0, 0, 0.75)',
      colorBgOverlay: 'rgba(255, 255, 255, 0.4)',
    };

    // 背景风格 + 导航风格的 token → jcode_*
    const navToken = resolveThemeToken(setting.nav, setting.colorType);
    Object.keys(navToken).forEach((key) => {
      const value = (navToken as Record<string, any>)[key];
      if (value !== undefined && value !== '') {
        token[`jcode_${key}`] = value;
      }
    });

    return {
      algorithm: [compactAlgorithm] as any[],
      components: {
        Tag: {
          fontSizeSM: 12,
        },
      },
      token,
    };
  });

  const isDark = computed(() => false);

  return {
    isDark,
    themeConfig,
  };
}
