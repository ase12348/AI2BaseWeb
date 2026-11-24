import type { AppPageConfig, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const buttons: ButtonType[] = [
  {
    prop: 'add',
    label: '新建',
    type: 'primary',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  { prop: 'edit', label: '编辑' },
  { prop: 'copy', label: '复制' },
  { prop: 'delete', label: '删除', danger: true },
];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [
    { name: '名称', field: 'f_Name' },
    { name: '图标', field: 'f_Icon' },
    { name: '描述', field: 'f_Description' },
    { name: '内置', field: 'f_IsBuiltIn' },
    { name: '已发布', field: 'f_Published' },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '智能体管理',
  columns: [],
  buttons,
  forms: [mainForm],
});
