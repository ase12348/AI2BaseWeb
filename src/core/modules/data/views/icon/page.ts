import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_Name', minWidth: 200, isKeyword: true },
  { label: '编码', prop: 'f_Code', minWidth: 200, isKeyword: true },
  {
    label: '分类',
    prop: 'f_Category',
    width: 140,
    align: 'center',
    config: { dataType: 'dataItem', dataCode: 'systemIcon' },
  },
  { label: '创建用户', prop: 'f_CreateUserName', width: 100, isKeyword: true },
  {
    label: '最后更新',
    prop: 'f_ModifyDate',
    width: 160,
    isKeyword: true,
    config: { dataType: 'dateTime' },
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
  {
    prop: 'dataItem',
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
    {
      name: '布局',
      field: 'hpanel',
      children: [
        { name: '名称', field: 'f_Name' },
        { name: '编码', field: 'f_Code' },
        { name: '类型', field: 'f_Category' },
        { name: '宽度', field: 'f_Width' },
        { name: '高度', field: 'f_Height' },
        { name: '图标', id: 'icon', slot: 'right' },
      ],
    },

    { name: '数据', field: 'f_Body' },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '图标管理',
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
