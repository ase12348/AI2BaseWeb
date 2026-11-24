import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '用户名称', prop: 'f_Name', minWidth: 120, isKeyword: true },
  { label: '用户编码', prop: 'f_Code', minWidth: 120, isKeyword: true },
  { label: '图标', prop: 'f_Icon', width: 60, align: 'center', isKeyword: true },
  { label: '创建人', prop: 'f_CreateUserName', width: 100, align: 'center', isKeyword: true },
  {
    label: '创建时间',
    prop: 'f_CreateDate',
    width: 160,
    isKeyword: true,
    config: { dataType: 'dateTime' },
  },
  { label: '备注', prop: 'f_Description', width: 200, isKeyword: true },
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
    { name: '图标', field: 'f_Icon' },
    { name: '颜色', field: 'f_Colour' },
    { name: 'pc链接', field: 'f_Url' },
    { name: '移动连接', field: 'f_AppUrl' },
    { name: '备注', field: 'f_Description' },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '消息用户',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
