import type { AppModuleConfig } from '/#/config';

import { t } from '@/core/locales/setupI18n';

export default {
  name: t('任务调度模块'),
  code: 'quartz',
  version: '1.0.0',
  description: `${t('任务调度设计')}，${t('任务执行日志')}`,
} as AppModuleConfig;
