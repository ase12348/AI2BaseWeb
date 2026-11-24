import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_FullName', minWidth: 260, isKeyword: true },
  { label: '编码', prop: 'f_EnCode', minWidth: 150, isKeyword: true },
  { label: '层级编码', prop: 'f_DeepNum', width: 100 },
  { label: '简称', prop: 'f_ShortName', minWidth: 150, isKeyword: true },
  { label: '排序', prop: 'f_SortCode', width: 80, align: 'center' },
  {
    label: '负责人',
    prop: 'f_Manager',
    width: 100,
    align: 'center',
    config: {
      dataType: 'user',
    },
  },
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
      name: '简称',
      field: 'f_ShortName',
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
      name: '负责人',
      field: 'f_Manager',
    },
    {
      name: '电话',
      field: 'f_OuterPhone',
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
  title: '公司管理',
  columns: [{ list: columns }], //{ label: '测试', id: 'xx', list: columns2 }
  buttons: buttons /*[
    { buttonList: buttons, id: '', label: '测试1' },
    { buttonList: buttons2, id: 'xxx1', label: '测试2' },
  ],*/,
  forms: [mainForm],
});
