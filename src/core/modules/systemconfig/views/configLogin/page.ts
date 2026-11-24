import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [];

const buttons: ButtonType[] = [];

export default defineConfig<AppPageConfig>({
  title: '登录策略',
  columns: [{ list: columns }],
  buttons,
});
