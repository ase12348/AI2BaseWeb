import type { AppPageConfig } from '/#/page';
import { defineConfig } from '/@/core/utils';

export default defineConfig<AppPageConfig>({
  title: '403',
  isNotAuth: true,
  isNotMenu: true,
  isNotTab: true,
});
