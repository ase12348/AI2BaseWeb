import type { FormAuthConfigType } from '/#/form';
import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_Name', minWidth: 200, isKeyword: true },
  { label: '编号', prop: 'f_EnCode', width: 120, isKeyword: true },
  {
    label: '部门',
    prop: 'f_DepartmentId',
    width: 160,
    config: {
      dataType: 'department',
    },
  },
  { label: '创建人', prop: 'f_CreateUserName', width: 100 },
  { label: '创建时间', prop: 'f_CreateDate', width: 100, config: { dataType: 'date' } },
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
  { prop: 'memberAdd', label: '添加成员' },
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
      field: 'f_Name',
    },
    {
      name: '部门',
      field: 'f_DepartmentId',
    },
    {
      name: '上级',
      field: 'f_ParentId',
    },
    {
      name: '描述',
      field: 'f_Description',
    },
  ],
};
export default defineConfig<AppPageConfig>({
  title: '岗位管理',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
