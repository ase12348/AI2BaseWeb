import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '编号', prop: 'f_EnCode', width: 160, isNotAutoWrap: true },
  { label: '名称', prop: 'f_FullName', width: 140 },
  { label: '地址', prop: 'f_UrlAddress', minWidth: 160, isNotAutoWrap: true },
  {
    label: '目标',
    prop: 'f_Target',
    width: 100,
    align: 'center',
    config: {
      dataType: 'options',
      options: [
        {
          value: 'expand',
          label: '菜单目录',
        },
        {
          value: 'view',
          label: '功能页面',
        },
        {
          value: 'blankView',
          label: '独立页面',
        },
        {
          value: 'custmerView',
          label: '页面设计',
        },
        {
          value: 'desktopView',
          label: '桌面设计',
        },
        {
          value: 'biView',
          label: '大屏设计',
        },
      ],
    },
  },
  { label: '排序', prop: 'f_SortCode', width: 64, align: 'center' },
  { label: '状态', prop: 'f_EnabledMark', width: 64, align: 'center' },
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
  isWorkflow: true,
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
      name: '上级',
      field: 'f_ParentId',
    },
    {
      name: '图标',
      field: 'f_Icon',
    },
    {
      name: '目标',
      field: 'f_Target',
    },
    {
      name: '排序',
      field: 'f_SortCode',
    },
    {
      name: '地址',
      field: 'f_UrlAddress',
    },
    {
      name: '菜单',
      field: 'f_IsMenu',
    },
    {
      name: '状态',
      field: 'f_EnabledMark',
    },
    {
      name: '描述',
      field: 'f_Description',
    },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '菜单管理',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
