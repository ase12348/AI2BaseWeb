import 'ant-design-vue/dist/reset.css';
import 'virtual:uno.css';
import '@/core/ui/design/index.less';
import { createApp } from 'vue';
import { setupStore } from '@/core/store';
import { registerGlobComp } from './registerGlobComp';
import { setupI18n } from '@/core/locales/setupI18n';
import { router, setupRouter } from '@/core/router';
import { setupRouterGuard } from '@/core/router/guard';
import jcodeIcon from './icon';
import { onlineInit } from '/@/core/utils/online';
import { setupAuthTokenRuntime } from '/@/core/utils/http/tokenRefresh';

import App from './App.vue';
// 模块列表
import modules from './modules';

const bootstrap = async (devModules: never[]) => {
  const app = createApp(App);
  // 加载图标
  await jcodeIcon.init();

  // 配置 store
  setupStore(app);

  // 双 token：恢复访问令牌主动续期 + 跨标签页令牌同步
  setupAuthTokenRuntime();

  // 设置多语言
  await setupI18n(app);

  // 注册全局组件
  registerGlobComp(app);

  const routes = [];
  // @ts-ignore
  window.jcode_app_authdata = {};
  // 组件名映射
  // @ts-ignore
  window.jcode_app_component_names = {};
  // @ts-ignore
  modules.push(...devModules);
  modules.forEach((m) => {
    // 权限数据设置
    // @ts-ignore
    if (m.pageAuthData) {
      // @ts-ignore
      Object.keys(m.pageAuthData).forEach((key) => {
        // @ts-ignore
        window.jcode_app_authdata[key] = m.pageAuthData[key];
      });
    }

    // 注入路由信息
    // @ts-ignore
    m.routes && routes.push(...m.routes);

    // 添加全局组件
    // @ts-ignore
    m.components &&
      // @ts-ignore
      m.components.forEach((com) => {
        app.component(com.name, com.component);
        // @ts-ignore
        window.jcode_app_component_names[com.name.toLowerCase()] = com.name;
      });
  });

  // 设置路由（只注册路由表；app.use 见下方说明）
  setupRouter(routes);

  // 设置路由守卫
  setupRouterGuard(router);

  app.use(router);

  app.mount('#app');

  await onlineInit();
};

export default bootstrap;
