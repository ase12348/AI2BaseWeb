import type { AppPageConfig } from '/#/page';
import { defineConfig } from '/@/core/utils';

export default defineConfig<AppPageConfig>({
  title: '404',
  isNotAuth: true,
  isNotMenu: true,
  isNotTab: true,
});
