/**
 * 主题-背景风格配置
 */
import type { NavThemeToken } from './theme';

export interface ColorTypeThemeConfig {
  /** 展示名称（设置面板 tooltip） */
  name: string;
  /** 背景风格标识（写入 body class 与主题设置） */
  colorType: string;
  /** 整屏背景图 url（写入 --jcode-app-bg-image） */
  bgImage: string;
  /** 菜单明暗（缺省 light，透明侧栏用深色文字） */
  menuTheme?: 'light' | 'dark';
  /** 默认 CSS 变量 token 集 */
  themeToken: NavThemeToken;
  /** 按导航风格细分覆盖（nav → token），缺省用 themeToken */
  navTokens?: Record<string, NavThemeToken>;
}

export const bgUrl = (name: string) => `url('${import.meta.env.BASE_URL}bg/${name}')`;

// 背景图主题共用 token：头部/侧栏全透明，直接透出整屏背景图
const bgThemeToken: NavThemeToken = {
  colorBgHeader: 'transparent',
  colorBorderHeader: 'transparent',
  colorLogoText: 'var(--color-text)',
  colorTextBtnHeader: 'var(--color-text)',
  colorBgBtnHeader: 'rgba(255, 255, 255, 0.16)',
  colorBgSider: 'transparent',
  colorBorderRightSider: 'transparent',
  colorBorderCollapseTopSider: 'transparent',
  colorBorderCollapseBottomSider: 'transparent',
  colorTextCollapse: 'var(--color-text)',
  colorBgBtnCollapse: 'rgba(255, 255, 255, 0.16)',
  colorAvatarHeader: '#1668dc',
  colorHoverBg: 'rgba(255, 255, 255, 0.24)',
};

export default [
  {
    name: '天蓝浮泡',
    colorType: 'bg3',
    bgImage: bgUrl('bg3.png'),
    themeToken: bgThemeToken,
  },
  {
    name: '雾蓝流影',
    colorType: 'bg1',
    bgImage: bgUrl('bg1.png'),
    themeToken: bgThemeToken,
  },
  {
    name: '淡紫几何',
    colorType: 'bg2',
    bgImage: bgUrl('bg2.png'),
    themeToken: bgThemeToken,
  },
  {
    name: '青翠叶影',
    colorType: 'bg4',
    bgImage: bgUrl('bg4.png'),
    themeToken: bgThemeToken,
  },
  {
    name: '蓝色圣诞',
    colorType: 'blue-christmas',
    bgImage: bgUrl('blue-christmas-bg-2Vz9CVjx.png'),
    themeToken: bgThemeToken,
  },
  {
    name: '蓝色天空',
    colorType: 'blue-sky',
    bgImage: bgUrl('blue-sky-bg-C2_IKEIe.png'),
    themeToken: bgThemeToken,
  },
  {
    name: '绿色山峦',
    colorType: 'green-mountain',
    bgImage: bgUrl('green-mountain-bg-BEJLG1gf.jpg'),
    themeToken: bgThemeToken,
  },
  {
    name: '橙色气泡',
    colorType: 'orange-bubble',
    bgImage: bgUrl('orange-bubble-bg-CQ0LR0tF.jpg'),
    themeToken: bgThemeToken,
  },
  {
    name: '泼墨彩绘',
    colorType: 'paint-splashing',
    bgImage: bgUrl('paint-splashing-bg-DZMwRxI_.jpg'),
    themeToken: bgThemeToken,
  },
] as ColorTypeThemeConfig[];
