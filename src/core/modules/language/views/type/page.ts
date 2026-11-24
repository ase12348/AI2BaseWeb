import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_Name', isKeyword: true },
  { label: '编码', prop: 'f_Code', isKeyword: true },
];

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
  schema: [
    { name: '名称', field: 'f_Name' },
    { name: '编码', field: 'f_Code' },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '语言类型',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
