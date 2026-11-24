import type { AppPageConfig } from '/#/page';
import { defineConfig } from '/@/core/utils';

export default defineConfig<AppPageConfig>({
  title: '500',
  isNotAuth: true,
  isNotMenu: true,
  isNotTab: true,
});
