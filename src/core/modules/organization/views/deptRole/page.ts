import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'fName', minWidth: 120, isKeyword: true },
  { label: '编码', prop: 'fCode', minWidth: 120 },
  {
    label: '分类',
    prop: 'fCategory',
    width: 160,
    align: 'center',
    config: {
      dataType: 'dataItem',
      dataCode: 'deptRoleCategory',
    },
  },
  { label: '有效', prop: 'fEnabledMark', width: 64, align: 'center' },
  { label: '排序', prop: 'fSortCode', width: 80, align: 'center' },
  {
    label: '最后更新时间',
    prop: 'fModifyDate',
    width: 160,
    align: 'center',
    config: {
      dataType: 'dateTime',
    },
  },
  {
    label: '最后更新人',
    prop: 'fModifyUserName',
    width: 88,
    align: 'center',
  },
];

const buttons: ButtonType[] = [
  {
    prop: 'dataItem',
    label: '分类管理',
    classify: 'tool',
    icon: 'ant-design:tool-filled',
  },
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
      name: '编号',
      field: 'fCode',
    },
    {
      name: '名称',
      field: 'fName',
    },
    {
      name: '分类',
      field: 'fCategory',
    },
    {
      name: '状态',
      field: 'fEnabledMark',
    },
    {
      name: '排序',
      field: 'fSortCode',
    },
    {
      name: '描述',
      field: 'fDes',
    },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '部门角色管理',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
  childPages: [
    {
      name: '分类管理',
      id: 'data_dataitem_index',
      notPages: ['data_dataitem_classifys_index'],
      notButtons: ['classifys'],
    },
  ],
});
