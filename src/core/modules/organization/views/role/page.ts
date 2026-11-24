import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '编号', prop: 'f_EnCode', minWidth: 110, isKeyword: true },
  { label: '名称', prop: 'f_FullName', minWidth: 120, isKeyword: true },
  {
    label: '分类',
    prop: 'f_Category',
    width: 100,
    align: 'center',
    config: {
      dataType: 'dataItem',
      dataCode: 'rolecategory',
    },
  },
  {
    label: '创建时间',
    prop: 'f_CreateDate',
    width: 160,
    align: 'center',
    config: {
      dataType: 'dateTime',
    },
  },
  {
    label: '创建人',
    prop: 'f_CreateUserName',
    width: 88,
    align: 'center',
  },
  { label: '有效', prop: 'f_EnabledMark', width: 64, align: 'center' },
];

const buttons: ButtonType[] = [
  {
    prop: 'dataItem',
    label: '分类管理',
    classify: 'tool',
    icon: 'ant-design:tool-filled',
  },

  {
    prop: 'export',
    label: '导出',
    layerTitle: '角色数据导出',
    action: 'exportExcel',
    classify: 'panel',
  },
  {
    prop: 'export',
    label: '导入',
    layerTitle: '角色数据导入',
    action: 'importExcel',
    classify: 'panel',
    importCode: 'roleImport',
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
  { prop: 'memberAdd', label: '添加成员', width: 60 },
];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [
    {
      name: '编号',
      field: 'f_EnCode',
    },
    {
      name: '名称',
      field: 'f_FullName',
    },
    {
      name: '分类',
      field: 'f_Category',
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
  title: '角色管理',
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
