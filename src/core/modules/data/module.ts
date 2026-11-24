import type { AppModuleConfig } from '/#/config';

import { t } from '@/core/locales/setupI18n';

export default {
  name: t('数据模块'),
  code: 'data',
  version: '1.0.0',
  description: `${t('数据库管理')}，${t('数据字典')}，${t('省市数据')}，${t('单号编码')}`,
} as AppModuleConfig;
