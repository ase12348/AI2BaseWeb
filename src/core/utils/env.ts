import type { GlobEnvConfig } from '/#/config';
import pkg from '../../../package.json';

export function getCommonStoragePrefix() {
  const { VITE_GLOB_APP_NAME } = getAppEnvConfig();
  return `jcode__${VITE_GLOB_APP_NAME}`.toUpperCase();
}

// Generate cache key according to version
export function getStorageShortName() {
  return `${getCommonStoragePrefix()}${`__${pkg.version}`}__`.toUpperCase();
}

const getVariableName = (title: string) => {
  return `__PRODUCTION__${title}__CONF__`.toUpperCase().replace(/\s/g, '');
};
export function getAppEnvConfig() {
  const ENV_NAME = getVariableName('jcode_framework');
  // @ts-ignore
  const ENV = import.meta.env.DEV
    ? // Get the global configuration (the configuration will be extracted independently when packaging)
      (import.meta?.env as unknown as GlobEnvConfig)
    : (window[ENV_NAME] as unknown as GlobEnvConfig);
  const {
    VITE_GLOB_APP_NAME,
    VITE_GLOB_API_URL,
    VITE_GLOB_PATH,
    VITE_GLOB_IM_URL,
    VITE_GLOB_REPORT_URL,
    VITE_GLOB_ISONLINE,
  } = ENV;
  return {
    VITE_GLOB_APP_NAME,
    VITE_GLOB_API_URL,
    VITE_GLOB_PATH,
    VITE_GLOB_IM_URL,
    VITE_GLOB_REPORT_URL,
    VITE_GLOB_ISONLINE,
  };
}

/**
 * @description: Development mode
 */
export const devMode = 'development';

/**
 * @description: Production mode
 */
export const prodMode = 'production';

/**
 * @description: Get environment variables
 * @returns:
 * @example:
 */
export function getEnv(): string {
  return import.meta.env.MODE;
}

/**
 * @description: Is it a development mode
 * @returns:
 * @example:
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV;
}

/**
 * @description: Is it a production mode
 * @returns:
 * @example:
 */
export function isProdMode(): boolean {
  return import.meta.env.PROD;
}
