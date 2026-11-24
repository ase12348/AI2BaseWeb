import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_FullName', minWidth: 150, isKeyword: true },
  { label: '编码', prop: 'f_EnCode', width: 100 },
  { label: '层级编码', prop: 'f_DeepNum', width: 100 },
  { label: '公司', prop: 'f_CompanyId', width: 150, config: { dataType: 'company' } },
  { label: '排序', prop: 'f_SortCode', width: 80, align: 'center' },
  { label: '负责人', prop: 'f_Manager', width: 80, align: 'center', config: { dataType: 'user' } },
  { label: '电话号', prop: 'f_OuterPhone', width: 100 },
  { label: '分机号', prop: 'f_InnerPhone', width: 70, align: 'center' },
  { label: '企微Id', prop: 'f_WechatDepId', width: 100 },
  { label: '企微同步状态', prop: 'f_WechatSyn', width: 100, align: 'center' },
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
    {
      name: '名称',
      field: 'f_FullName',
    },
    {
      name: '编码',
      field: 'f_EnCode',
    },
    {
      name: '简称',
      field: 'f_ShortName',
    },
    {
      name: '性质',
      field: 'f_Nature',
    },
    {
      name: '公司',
      field: 'f_CompanyId',
    },
    {
      name: '上级',
      field: 'f_ParentId',
    },
    {
      name: '负责人',
      field: 'f_Manager',
    },
    {
      name: '电话',
      field: 'f_OuterPhone',
    },
    {
      name: '分机号',
      field: 'f_InnerPhone',
    },
    {
      name: '邮箱',
      field: 'f_Email',
    },
    {
      name: '排序',
      field: 'f_SortCode',
    },
    {
      name: '图标',
      field: 'f_Icon',
    },
    {
      name: '说明',
      field: 'f_Description',
    },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '部门管理',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
