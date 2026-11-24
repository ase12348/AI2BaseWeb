import type { WebConfig } from '/#/config';
import config from '../../package.json';

function defineConfig<T>(config: T): T {
  return config;
}
export default defineConfig<WebConfig>({
  version: config.version,
  edition: '社区版',
  title: 'AI应用开发基座',
  company: '苏州极简搭信息技术有限公司',
  prefixCls: 'jcode',
  language: {
    mainType: 'chinese',
    type: 'chinese',
  },
  cache: {
    time: 60 * 60 * 24 * 7,
    isEncrypted: true,
    key: 'jcode_vue3_key',
    iv: '1234567890000000',
  },
  loginPage: {
    logo: 'logo.png',
    darkLogo: 'logo.png',
    bgImg: 'resource/login/bg.png',
    darkBgImg: 'resource/login/bg-dark.png',
    url: '/login/page',
  },
  homePage: {
    // 控制台首页固定为自带的控制台页，不再自动挂载动态桌面
    isDynamic: false,
    url: '/system/home/index',
  },
  theme: {
    // 账号没设置过时的默认导航风格（side mix top side2）；
    // 控制台与应用开发工作台恒为混合布局，见 hooks/setting/useAppSetting
    nav: 'side',
    // 背景风格（整屏背景图）见 config/themeColor
    colorType: 'bg3',
    // 主题色标识
    color: 'blue',
    showTabs: true,
    showIcon: true,
    sideWidth: 232,
    headerHeight: 56,
  },
  params: {
    userCenterUrl: '/login/userCenter',
    imOpen: true,
    isTenant: false,
    isSecretLevel: false,
    isNotShowAdmin: false,
    isTabsCache: true,
    mapKey: '',
  },
});
