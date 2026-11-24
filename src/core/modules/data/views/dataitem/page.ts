import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_ItemName', minWidth: 100, isKeyword: true },
  { label: '编码', prop: 'f_ItemValue', minWidth: 100, isKeyword: true },
  { label: '排序', prop: 'f_SortCode', width: 64, align: 'center', isKeyword: true },
  { label: '有效', prop: 'f_EnabledMark', width: 64, align: 'center', isKeyword: true },
];

const buttons: ButtonType[] = [
  {
    prop: 'add',
    label: '新增',
    type: 'primary',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  {
    prop: 'classifys',
    label: '分类管理',
    classify: 'tool',
    icon: 'ant-design:tool-filled',
  },
  { prop: 'edit', label: '编辑' },
  { prop: 'delete', label: '删除', danger: true },
];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [
    { name: '上级', field: 'f_ParentId' },
    { name: '项目名', field: 'f_ItemName' },
    { name: '项目值', field: 'f_ItemValue' },
    { name: '排序', field: 'f_SortCode' },
    { name: '有效', field: 'f_EnabledMark' },
    { name: '备注', field: 'f_Description' },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '数据字典',
  isLayer: true,
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
  childPages: [{ name: '分类管理', id: 'data_dataitem_classifys_index' }],
});
