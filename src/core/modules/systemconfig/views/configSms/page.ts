import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [];

const buttons: ButtonType[] = [];

export default defineConfig<AppPageConfig>({
  title: '发送短信配置',
  columns: [{ list: columns }],
  buttons,
});
