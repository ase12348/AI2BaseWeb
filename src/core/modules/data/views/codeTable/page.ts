import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '表名', prop: 'f_TableName', minWidth: 200, isKeyword: true },
  { label: '说明', prop: 'f_Description', minWidth: 200, isKeyword: true },
  { label: '状态', prop: 'f_State', width: 80, align: 'center' },
];
const childColumns: ColumnType[] = [
  { prop: 'f_DbColumnName', label: '名称', minWidth: 120 },
  { prop: 'f_CsType', label: '类型', width: 120 },
  { prop: 'f_Length', label: '长度', width: 80 },
  { prop: 'f_DecimalDigits', label: '小数位', width: 64 },
  { prop: 'f_IsNullable', label: '可空', width: 64, align: 'center' },
  { prop: 'f_IsPrimaryKey', label: '主键', width: 64, align: 'center' },
  { prop: 'f_IsIdentity', label: '自增', width: 64, align: 'center' },
  { prop: 'f_Description', label: '备注', minWidth: 120 },
];

const buttons: ButtonType[] = [
  {
    prop: 'import',
    label: '导入表',
    classify: 'panel',
  },
  {
    prop: 'add',
    label: '新增',
    type: 'primary',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  {
    prop: 'clean',
    label: '清理失效登记',
    classify: 'panel',
    icon: 'ant-design:clear-outlined',
  },

  { prop: 'edit', label: '编辑' },
  { prop: 'update', label: '同步' },
  { prop: 'updateTable', label: '更新到表' },
  { prop: 'delete', label: '删除', danger: true },
];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [
    {
      name: '布局',
      id: 'layout',
      type: 'layout',
      children: [
        { name: '表名', field: 'f_TableName', slot: 'top' },
        { name: '备注', field: 'f_Description', slot: 'top' },
        {
          name: '',
          table: 'dbcode',
          children: [
            {
              name: '名称',
              field: 'f_DbColumnName',
            },
            {
              name: '类型',
              field: 'f_CsType',
            },
            {
              name: '长度',
              field: 'f_Length',
            },
            {
              name: '小数点',
              field: 'f_DecimalDigits',
            },
            {
              name: '可空',
              field: 'f_IsNullable',
            },
            {
              name: '主键',
              field: 'f_IsPrimaryKey',
            },
            {
              name: '自增',
              field: 'f_IsIdentity',
            },
            {
              name: '备注',
              field: 'f_Description',
            },
          ],
        },
      ],
    },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '数据模型',
  columns: [{ list: columns }, { label: '字段表', id: 'child', list: childColumns }],
  buttons,
  forms: [mainForm],
});
