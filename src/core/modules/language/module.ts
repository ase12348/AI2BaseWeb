import type { AppModuleConfig } from '/#/config';

import { t } from '@/core/locales/setupI18n';

export default {
  name: t('多语言模块'),
  code: 'language',
  version: '1.0.0',
  description: `${t('实现多国语言的切换')}，${t('统一管理语言翻译')}`,
} as AppModuleConfig;
