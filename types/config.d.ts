import { ThemeEnum, ThemeMenuEnum } from '/@/core/enums/appEnum';

export interface WebConfig {
  /**
   * 版本号
   */
  version: string;
  /**
   * 版本类型（如：社区版）
   */
  edition?: string;
  /*
   *标题
   */
  title: string;
  /*
   *公司
   */
  company: string;
  /*
   *版权年份（登录页与「关于」弹窗的 Copyright 展示共用）
   */
  copyrightYear: number;
  /*
   *UI 样式前缀
   */
  prefixCls?: string;
  /*
   *多语言设置
   */
  language: {
    /*
     *主语言，基于此语言翻译
     */
    mainType: string;
    /*
     *默认语言
     */
    type: string;
  };
  /*
   *缓存
   */
  cache: {
    /*
     *缓存时间
     */
    time: number;
    /*
     *是否加密
     */
    isEncrypted: boolean;
    /*
     *密钥
     */
    key: string;
    /*
     *密钥
     */
    iv: string;
  };
  /*
   *登录页面
   */
  loginPage: {
    logo: string;
    darkLogo: string;

    bgImg: string;
    darkBgImg: string;
    /*
     *地址
     */
    url: string;
  };
  /*
   *首页
   */
  homePage: {
    /*
     *是否开启动态首页
     */
    isDynamic: boolean;
    /*
     *静态首页地址
     */
    url: string;
  };
  /**
   * 主题配置
   */
  theme: ThemeConfig;
  /*
   *参数配置
   */
  params: {
    /**
     * 个人中心页面
     */
    userCenterUrl: string;
    /*
     * 是否开启即时通讯
     */
    imOpen: boolean;
    /*
     * 是否开启租户模式
     */
    isTenant: boolean;
    /*
     * 是否对业务开启密级过滤模式
     */
    isSecretLevel: boolean;
    /*
     * 不显示超级管理员选项。目前对流程有效
     */
    isNotShowAdmin: boolean;
    /*
     * 是否开启页签缓存
     */
    isTabsCache: boolean;
    /**
     * 地图密钥（百度）
     */
    mapKey: '';
  };
}

export interface GlobConfig {
  /**
   * 应用名称
   */
  name: string;
  /**
   * 应用标题
   */
  title: string;
  /**
   * 服务地址
   */
  apiUrl: string;
  /**
   * 服务地址前缀
   */
  urlPrefix?: string;
  /**
   * 即时通许地址
   */
  imUrl?: string;
  /**
   * 专业报表服务地址
   */
  reportUrl?: string;
  /**
   * 是否是体验地址
   */
  isOnline: boolean;
  /**
   * 框架配置信息
   */
  options: WebConfig;
}

export interface GlobEnvConfig {
  /**
   * 应用名称
   */
  VITE_GLOB_APP_NAME;
  /**
   * 服务地址
   */
  VITE_GLOB_API_URL: string;
  /**
   * 服务地址前缀
   */
  VITE_GLOB_PATH?: string;
  /**
   * 即时通许地址
   */
  VITE_GLOB_IM_URL?: string;
  /**
   * 专业报表服务地址
   */
  VITE_GLOB_REPORT_URL?: string;

  /**
   * 是否是体验地址
   */
  VITE_GLOB_ISONLINE?: boolean;
}

/**
 * 应用模块配置
 */
export interface AppModuleConfig {
  /**
   * 名称
   */
  name: string;
  /**
   * 编码
   */
  code: string;
  /**
   * 版本
   */
  version: string;
  /**
   * 描述
   */
  description: string;
}

export interface ThemeConfig {
  /**
   * 默认导航风格（取值见 /@/config/theme），账号保存后在应用内生效；
   * 控制台与应用开发工作台恒为 mix
   */
  nav: string;
  /**
   * 背景风格标识（见 /@/config/themeColor，整屏背景图）
   */
  colorType: string;
  /**
   * 主题色标识（见 /@/core/store/modules/app 的 themeColors）
   */
  color: string;
  /**
   * 是否显示页面选项卡
   */
  showTabs: boolean;
  /**
   * 是否显示二级菜单图标
   */
  showIcon: boolean;
  /**
   * 侧边栏菜单展开宽度
   */
  sideWidth: number;
  /**
   * 菜单头部高度
   */
  headerHeight: number;
}

export interface MenuAndThemeConfig {
  /**
   * 名称
   */
  name: string;
  /*
   * 导航布局类型 side min-side mix top buttom
   */
  menuType: ThemeMenuEnum;
  /**
   * 主题颜色
   */
  themes: ThemesConfig[];
}

export interface ThemesConfig {
  id: string;
  name: string;
  color?: string;
  activeColor?: string;

  /*
   * 模式 'light' 'dark'
   */
  mode: ThemeEnum;
  /**
   * 主题颜色
   */
  token: Record<string, any>;
  jcodeToken: Record<string, any>;
  jcodeLogo: string;
  jcodeLayerLogo?: string;
  menuTheme: string;
  menuMode: string;
  topMenuTheme?: string;
  topMenuMode?: string;
}
