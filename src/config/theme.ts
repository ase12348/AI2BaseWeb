/**
 * 主题-导航风格配置
 */
export interface NavThemeToken {
  /** 头部背景色 → --jcode-color-bg-header */
  colorBgHeader?: string;
  /** 头部线条色 → --jcode-color-border-header */
  colorBorderHeader?: string;
  /** logo 文字色 → --jcode-color-logo-text */
  colorLogoText?: string;
  /** 头部按钮文字色 → jcode_colorTextBtnHeader */
  colorTextBtnHeader?: string;
  /** 头部按钮悬停背景色 → jcode_colorBgBtnHeader */
  colorBgBtnHeader?: string;
  /** 左侧菜单背景色 → --jcode-color-bg-sider */
  colorBgSider?: string;
  /** 左侧菜单右边线 → --jcode-color-border-right-sider */
  colorBorderRightSider?: string;
  /** 折叠按钮上边线 → --jcode-color-border-collapse-top-sider */
  colorBorderCollapseTopSider?: string;
  /** 折叠按钮下边线 → --jcode-color-border-collapse-bottom-sider */
  colorBorderCollapseBottomSider?: string;
  /** 折叠按钮图标色 → jcode_colorTextCollapse */
  colorTextCollapse?: string;
  /** 折叠按钮悬停背景色 → jcode_colorBgBtnCollapse */
  colorBgBtnCollapse?: string;
  /** 头部头像背景色 → jcode_colorAvatarHeader */
  colorAvatarHeader?: string;
  /** 菜单项悬停背景色 → --jcode-color-hover-bg */
  colorHoverBg?: string;
}

export interface NavThemeItem {
  id: string;
  name: string;
  /** 菜单明暗（缺省 light，透明侧栏用深色文字） */
  menuTheme?: 'light' | 'dark';
  /** 侧栏菜单模式（缺省 inline） */
  menuMode?: 'vertical' | 'horizontal' | 'inline';
  /** 顶部菜单明暗 */
  topMenuTheme?: 'light' | 'dark';
  /** 顶部菜单模式 */
  topMenuMode?: 'vertical' | 'horizontal' | 'inline';
  /** CSS 变量 token 集 */
  themeToken: NavThemeToken;
  /** logo 资源（相对 urlPrefix） */
  jcodeLogo: string;
}

export interface NavThemeConfig {
  /** 展示名称（设置面板 tooltip） */
  name: string;
  /** 风格简介（设置面板悬浮提示） */
  desc: string;
  /** 导航类型：side mix top side2 */
  nav: string;
  themes: NavThemeItem[];
}

const defaultLogo = 'logo.png';

export default [
  {
    name: '侧边布局',
    desc: '菜单集中于左侧栏，层级清晰。',
    nav: 'side',
    themes: [
      {
        id: 'default',
        name: '默认',
        menuTheme: 'light',
        menuMode: 'inline',
        themeToken: {},
        jcodeLogo: defaultLogo,
      },
    ],
  },
  {
    name: '混合布局',
    desc: '顶部展示一级菜单，侧边展示二级菜单。',
    nav: 'mix',
    themes: [
      {
        id: 'default',
        name: '默认',
        menuTheme: 'light',
        menuMode: 'inline',
        topMenuTheme: 'light',
        topMenuMode: 'horizontal',
        themeToken: {},
        jcodeLogo: defaultLogo,
      },
    ],
  },
  {
    name: '顶部布局',
    desc: '菜单全部置于顶部。',
    nav: 'top',
    themes: [
      {
        id: 'default',
        name: '默认',
        menuTheme: 'light',
        menuMode: 'horizontal',
        topMenuTheme: 'light',
        topMenuMode: 'horizontal',
        themeToken: {},
        jcodeLogo: defaultLogo,
      },
    ],
  },
  {
    name: '简约侧边',
    desc: '窄侧栏，以图标纵向排列菜单，界面更紧凑。',
    nav: 'side2',
    themes: [
      {
        id: 'default',
        name: '默认',
        menuTheme: 'light',
        menuMode: 'vertical',
        themeToken: {},
        jcodeLogo: defaultLogo,
      },
    ],
  },
] as NavThemeConfig[];
