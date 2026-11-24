import type { AppModuleConfig } from '/#/config';

import { t } from '@/core/locales/setupI18n';

export default {
  name: t('系统管理模块'),
  code: 'system',
  version: '1.0.0',
  description: `${t('菜单')},${t('配置信息管理')}`,
} as AppModuleConfig;
