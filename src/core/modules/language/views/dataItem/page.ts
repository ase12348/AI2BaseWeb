import type { AppPageConfig, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const buttons: ButtonType[] = [{ prop: 'edit', label: '编辑' }];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [],
};

export default defineConfig<AppPageConfig>({
  title: '字典翻译',
  columns: [],
  buttons,
  forms: [mainForm],
});
