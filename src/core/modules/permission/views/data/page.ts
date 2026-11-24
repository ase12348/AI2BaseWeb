import type { FormAuthConfigType } from '/#/form';
import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '编码', prop: 'f_Code', minWidth: 120, isKeyword: true },
  { label: '名称', prop: 'f_Name', minWidth: 160, isKeyword: true },
  { label: '类型', prop: 'f_Type', width: 100, align: 'center' },
  { label: '授权类型', prop: 'f_ObjectType', width: 80, align: 'center' },
  {
    label: '授权对象',
    prop: 'f_ObjectId',
    width: 160,
    align: 'center',
  },

  { label: '创建人', prop: 'f_CreateUserName', width: 100 },
  { label: '创建时间', prop: 'f_CreateDate', width: 160, config: { dataType: 'dateTime' } },
];

const buttons: ButtonType[] = [
  {
    prop: 'add',
    label: '普通数据权限',
    type: 'primary',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  /*{
    prop: 'addDepForm',
    label: '部门数据权限',
    type: 'primary',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },*/
  {
    prop: 'addDataSource',
    label: '数据视图数据权限',
    classify: 'panel',
  },

  { prop: 'edit', label: '编辑' },
  { prop: 'delete', label: '删除', danger: true },
];
const mainForm: FormAuthConfigType = {
  path: 'dform',
  name: 'dform',
  schema: [
    {
      name: '数据源',
      field: 'f_Code',
    },
    {
      name: '名称',
      field: 'f_Name',
    },
    {
      name: '对象类型',
      field: 'f_ObjectType',
    },
    {
      name: '授权对象',
      field: 'f_ObjectId',
    },
    {
      name: '过滤公式',
      table: 'conditions',
      children: [
        {
          field: 'f_FieldId',
          name: '',
        },
        {
          field: 'f_Symbol',
          name: '',
        },
        {
          field: 'f_FiledValueType',
          name: '',
        },
        {
          field: 'f_FiledValue',
          name: '',
        },
      ],
    },
    {
      name: '公式',
      field: 'f_Formula',
    },
  ],
};
const Form: FormAuthConfigType = {
  path: 'form',
  name: 'form',
  schema: [
    {
      name: '编码',
      field: 'f_Code',
    },
    {
      name: '名称',
      field: 'f_Name',
    },
    {
      name: '对象类型',
      field: 'f_ObjectType',
    },
    {
      name: '授权对象',
      field: 'f_ObjectId',
    },
    {
      name: '过滤公式',
      table: 'conditions',
      children: [
        {
          field: 'f_FieldId',
          name: '',
        },
        {
          field: 'f_Symbol',
          name: '',
        },
        {
          field: 'f_FiledValueType',
          name: '',
        },
        {
          field: 'f_FiledValue',
          name: '',
        },
      ],
    },
    {
      name: '公式',
      field: 'f_Formula',
    },
  ],
};
const depForm: FormAuthConfigType = {
  path: 'depform',
  name: 'depform',
  schema: [
    {
      name: '编码',
      field: 'f_Code',
    },
    {
      name: '名称',
      field: 'f_Name',
    },
    {
      name: '对象类型',
      field: 'f_ObjectType',
    },
    {
      name: '授权对象',
      field: 'f_ObjectId',
    },
  ],
};
export default defineConfig<AppPageConfig>({
  title: '数据权限',
  columns: [{ list: columns }],
  buttons,
  forms: [Form, mainForm, depForm],
});
