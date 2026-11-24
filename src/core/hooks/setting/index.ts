import type { GlobConfig } from '/#/config';

import { getAppEnvConfig, isDevMode } from '/@/core/utils/env';
import webConfig from '/@/config/web';
import { resolveApiUrl } from '/@/core/app-api-url';

export const useGlobSetting = (): Readonly<GlobConfig> => {
  const {
    VITE_GLOB_APP_NAME,
    VITE_GLOB_API_URL,
    VITE_GLOB_PATH,
    VITE_GLOB_IM_URL,
    VITE_GLOB_REPORT_URL,
    VITE_GLOB_ISONLINE,
  } = getAppEnvConfig();

  if (webConfig.cache.isEncrypted) {
    webConfig.cache.isEncrypted = !isDevMode;
  }

  // 接口地址：应用独立开发模块设置了就用应用的，没设置就用宿主的
  const apiUrl = resolveApiUrl(VITE_GLOB_API_URL);

  // Take global configuration
  const glob: Readonly<GlobConfig> = {
    name: VITE_GLOB_APP_NAME,
    title: webConfig.title,
    apiUrl,
    urlPrefix: VITE_GLOB_PATH,
    imUrl: VITE_GLOB_IM_URL || apiUrl,
    reportUrl: VITE_GLOB_REPORT_URL,
    isOnline: VITE_GLOB_ISONLINE || false,
    options: webConfig,
  };

  return glob as Readonly<GlobConfig>;
};
