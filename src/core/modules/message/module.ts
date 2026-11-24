import type { AppModuleConfig } from '/#/config';

import { t } from '@/core/locales/setupI18n';

export default {
  name: t('消息模块'),
  code: 'message',
  version: '1.0.0',
  description: `${t('消息注册')}，${t('消息策略')}`,
} as AppModuleConfig;
