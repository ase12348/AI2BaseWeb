import type { AppModuleConfig } from '/#/config';

import { t } from '@/core/locales/setupI18n';

export default {
  name: t('组织机构'),
  code: 'organization',
  version: '1.0.0',
  description: `${t('帐号')}，${t('组织架构')}`,
} as AppModuleConfig;
