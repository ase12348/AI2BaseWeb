import type { AppPageConfig, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const buttons: ButtonType[] = [
  {
    prop: 'add',
    label: '新增',
    type: 'primary',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  { prop: 'edit', label: '编辑' },
  { prop: 'delete', label: '删除', danger: true },
];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [],
};
export default defineConfig<AppPageConfig>({
  title: '翻译管理',
  columns: [],
  buttons,
  forms: [mainForm],
});
