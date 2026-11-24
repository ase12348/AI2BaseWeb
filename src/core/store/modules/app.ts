import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { store } from '/@/core/store';
import { useGlobSetting } from '/@/core/hooks/setting';
import { api as themeApi } from '/@/core/modules/system/api/theme';
import navThemes, { type NavThemeToken } from '/@/config/theme';
import colorTypeThemes from '/@/config/themeColor';

const { options: webConfig } = useGlobSetting();

/** 主题设置（导航风格/背景风格/主题色/其它设置） */
export interface ThemeSetting {
  /** 背景风格标识（见 config/themeColor，整屏背景图，导航透明） */
  colorType: string;
  /** 导航布局，由账号各自保存；控制台渲染时固定混合布局，见 hooks/setting/useAppSetting */
  nav: string;
  /** 主题色标识 */
  color: string;
  /** 是否显示页面选项卡 */
  showTabs: boolean;
  /** 是否显示二级菜单图标 */
  showIcon: boolean;
  /** 侧边栏菜单展开宽度 */
  sideWidth: number;
  /** 菜单头部高度 */
  headerHeight: number;
}

/** 主题色对照表（rgb 三元组） */
export const themeColors: Record<string, string> = {
  blue: '22, 93, 255',
  red: '255, 52, 67',
  orange: '255, 134, 0',
  yellow: '250, 173, 20',
  cyan: '0, 198, 193',
  green: '0, 161, 0',
  blue2: '32, 85, 244',
  purple: '155, 80, 230',
};

/** rgb 三元组 → hex */
const rgbToHex = (rgb: string) =>
  `#${rgb
    .split(',')
    .map((v) => parseInt(v, 10).toString(16).padStart(2, '0'))
    .join('')}`;

/** 主题色对照表（hex，供 antd token 与色块展示使用） */
export const themeColorHex: Record<string, string> = Object.keys(themeColors).reduce(
  (acc, key) => {
    acc[key] = rgbToHex(themeColors[key]);
    return acc;
  },
  {} as Record<string, string>,
);

/** 查找导航风格配置 */
export const getNavThemeConfig = (nav: string) => navThemes.find((item) => item.nav === nav);

/** 查找背景风格配置 */
export const getColorTypeConfig = (colorType: string) =>
  colorTypeThemes.find((item) => item.colorType === colorType);

/** 合并当前导航风格主题与背景风格 token（导航风格优先覆盖） */
export const resolveThemeToken = (nav: string, colorType: string): NavThemeToken => {
  const colorConfig = getColorTypeConfig(colorType);
  const colorToken: NavThemeToken = colorConfig
    ? { ...colorConfig.themeToken, ...(colorConfig.navTokens?.[nav] || {}) }
    : {};
  const navTheme = getNavThemeConfig(nav)?.themes[0];
  return { ...colorToken, ...(navTheme?.themeToken || {}) };
};

/** 颜色混合 */
const mixHex = (color: string, target: string, ratio: number) => {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const c1 = parse(color);
  const c2 = parse(target);
  return `#${c1
    .map((v, i) =>
      Math.round(v + (c2[i] - v) * ratio)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
};

const THEME_CLASS_PREFIX = 'jcode-theme-colorType-';

const applyThemeSetting = (theme: ThemeSetting) => {
  const root = document.documentElement;
  // 动态 class：jcode-theme-colorType-{colorType}
  Array.from(root.classList).forEach((cls) => {
    if (cls.startsWith(THEME_CLASS_PREFIX)) root.classList.remove(cls);
  });
  root.classList.add(`${THEME_CLASS_PREFIX}${theme.colorType}`);
  // 头部高度 / 侧栏宽度
  root.style.setProperty('--jcode-header-height', `${theme.headerHeight}px`);
  root.style.setProperty('--jcode-side-width', `${theme.sideWidth}px`);
  // 整屏背景图（导航透明，直接透出）
  const bgImage = getColorTypeConfig(theme.colorType)?.bgImage;
  root.style.setProperty('--jcode-app-bg-image', bgImage || 'none');
  // 主色派生（antd 主色由 useTheme 写入 token；此处补充供 alpha 场景使用的变量）
  const primaryColor = themeColors[theme.color] || themeColors.blue;
  const primaryHex = rgbToHex(primaryColor);
  root.style.setProperty('--jcode-color-primary-rgb', primaryColor);
  root.style.setProperty('--jcode-color-primary-hover', mixHex(primaryHex, '#ffffff', 0.3));
  root.style.setProperty('--jcode-color-primary-active', mixHex(primaryHex, '#000000', 0.2));
  // 头部选项卡选中背景：主色 15% 透明
  root.style.setProperty('--color-primary-bg2', `rgba(${primaryColor}, 0.15)`);
  // 菜单 hover 背景（token 体系外的兜底变量，供 menu 样式直接引用）
  const hoverBg = resolveThemeToken(theme.nav, theme.colorType).colorHoverBg;
  if (hoverBg) {
    root.style.setProperty('--jcode-color-hover-bg', hoverBg);
  } else {
    root.style.removeProperty('--jcode-color-hover-bg');
  }
};

export const useAppStore = defineStore('app', () => {
  // 菜单是否收拢
  const menuCollapsed = ref(false);

  // 主题设置：默认值来自 config/web，登录后以服务端当前账号的配置为准
  const themeSetting = reactive<ThemeSetting>({ ...webConfig.theme });

  /** 菜单是否收拢 */
  const setMenuCollapsed = () => {
    menuCollapsed.value = !menuCollapsed.value;
  };

  /** 更新主题设置（即时生效，保存后才写入当前账号） */
  const setThemeSetting = (partial: Partial<ThemeSetting>) => {
    Object.assign(themeSetting, partial);
    applyThemeSetting(themeSetting);
  };

  /** 恢复默认主题（不删除当前账号已保存的配置） */
  const clearThemeSetting = () => {
    Object.assign(themeSetting, webConfig.theme);
    applyThemeSetting(themeSetting);
  };

  /** 放弃未保存的改动，还原为当前账号已保存的主题；未保存过时回到默认主题 */
  const resetThemeSetting = async () => {
    try {
      const data = await themeApi.get();
      const content = data?.f_Content ? JSON.parse(data.f_Content) : null;
      Object.assign(themeSetting, webConfig.theme, content || {});
      applyThemeSetting(themeSetting);
      hasFetchedThemeFromServer = true;
    } catch (e) {
      clearThemeSetting();
    }
  };

  /** 保存当前主题设置到当前登录账号，返回是否保存成功 */
  const saveThemeSetting = async () => {
    // 业务失败时响应拦截器返回 false（不抛异常）
    const res = await themeApi.save({ ...themeSetting });
    return res !== false;
  };

  // 加载中的主题设置请求（多处同时加载时避免重复请求）
  let themeSettingPromise: Promise<void> | null = null;
  // 本次页面加载是否已从服务端成功拉取过主题设置（仅内存标记，刷新后重置）
  let hasFetchedThemeFromServer = false;

  /**
   * 拉取当前登录账号的主题设置并应用。
   * 服务端是唯一数据源：不带本地缓存覆盖，切账号后不会沿用上一个账号的主题。
   */
  const fetchThemeSetting = async () => {
    try {
      const data = await themeApi.get();
      const content = data?.f_Content ? JSON.parse(data.f_Content) : null;
      Object.assign(themeSetting, webConfig.theme, content || {});
      applyThemeSetting(themeSetting);
      hasFetchedThemeFromServer = true;
    } catch (e) {
      // 主题加载失败不阻断页面，沿用默认设置
      console.error(e);
    }
  };

  /** 加载主题设置（默认使用本次页面加载已拉取过的结果） */
  const loadThemeSetting = (isCache = true) => {
    if (isCache && hasFetchedThemeFromServer) {
      return Promise.resolve();
    }
    if (!themeSettingPromise) {
      themeSettingPromise = fetchThemeSetting().finally(() => {
        themeSettingPromise = null;
      });
    }
    return themeSettingPromise;
  };

  const resetState = () => {};

  // 进入 store 时先应用默认值，登录后由路由守卫拉取当前账号的主题
  applyThemeSetting(themeSetting);

  return {
    menuCollapsed,
    themeSetting,
    setMenuCollapsed,
    setThemeSetting,
    clearThemeSetting,
    resetThemeSetting,
    saveThemeSetting,
    loadThemeSetting,
    resetState,
  };
});

// Need to be used outside the setup
export function useAppStoreWithOut() {
  return useAppStore(store);
}
