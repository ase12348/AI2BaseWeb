import type { AppPageConfig } from '/#/page';
import { defineConfig } from '/@/core/utils';

export default defineConfig<AppPageConfig>({
  title: '个人中心',
  isNotMenu: true,
});
