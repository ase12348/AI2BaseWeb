import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '类型', prop: 'f_Type', width: 72, align: 'center', isKeyword: true },
  { label: '编码', prop: 'f_Code', minWidth: 160, isKeyword: true },
  { label: '名称', prop: 'f_Name', minWidth: 150, isKeyword: true },
  {
    // 分类目录已去掉：这一列改叫「标签」，值沿用 F_Category 存逗号分隔的标签串，
    // 由 index.vue 的 columnsConfig 渲染成多个 Tag（不再走 datasourceType 字典映射）
    label: '标签',
    prop: 'f_Category',
    minWidth: 160,
    align: 'left',
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
    prop: 'addCode',
    label: '新增JS视图',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  {
    prop: 'addTable',
    label: '新增表视图',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  {
    prop: 'add',
    label: '新增SQL视图',
    type: 'primary',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  { prop: 'edit', label: '编辑' },
  { prop: 'look', label: '查看' },
  { prop: 'delete', label: '删除', danger: true },
];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [
    {
      name: '属性设置',
      id: 'collapse',
      type: 'collapse',
      children: [
        {
          name: '基础信息',
          children: [
            { name: '名称', field: 'f_Name' },
            { name: '编码', field: 'f_Code' },
            { name: '标签', field: 'f_Category' },
            { name: '备注', field: 'f_Description' },
          ],
        },
        {
          name: '参数字段',
          children: [
            {
              name: '参数字段',
              table: 'queryFields',
              children: [
                { name: '参数名称', field: 'name' },
                { name: '中文名称', field: 'coment' },
                { name: '数据类型', field: 'type' },
                { name: '默认值', field: 'default' },
              ],
            },
          ],
        },
        {
          name: '排序字段',
          children: [
            {
              name: '排序字段',
              table: 'orders',
              children: [
                { name: '字段', field: 'field' },
                { name: '倒序', field: 'isDESC' },
              ],
            },
          ],
        },
        {
          name: '字段信息',
          children: [
            {
              name: '字段信息',
              table: 'fields',
              children: [{ name: '', field: 'name' }],
            },
          ],
        },
      ],
    },
  ],
};
const codeForm: FormAuthConfigType = {
  path: 'codeform',
  name: 'codeform',
  schema: [
    {
      name: '属性设置',
      id: 'collapse',
      type: 'collapse',
      children: [
        {
          name: '基础信息',
          children: [
            { name: '名称', field: 'f_Name' },
            { name: '编码', field: 'f_Code' },
            { name: '标签', field: 'f_Category' },
            { name: '备注', field: 'f_Description' },
          ],
        },
        {
          name: '输入数据源',
          children: [
            {
              name: '输入数据源',
              table: 'inputDbSource',
              children: [
                { name: '', field: 'code' },
                { name: '', field: 'code2' },
              ],
            },
          ],
        },
        {
          name: '参数字段',
          children: [
            {
              name: '参数字段',
              table: 'queryFields',
              children: [
                { name: '参数名称', field: 'name' },
                { name: '中文名称', field: 'coment' },
                { name: '数据类型', field: 'type' },
                { name: '默认值', field: 'default' },
              ],
            },
          ],
        },
        {
          name: '排序字段',
          children: [
            {
              name: '排序字段',
              table: 'orders',
              children: [
                { name: '字段', field: 'field' },
                { name: '倒序', field: 'isDESC' },
              ],
            },
          ],
        },
        {
          name: '字段信息',
          children: [
            {
              name: '字段信息',
              table: 'fields',
              children: [{ name: '', field: 'name' }],
            },
          ],
        },
      ],
    },
  ],
};
const tableForm: FormAuthConfigType = {
  path: 'tableform',
  name: 'tableform',
  schema: [
    {
      name: '属性设置',
      id: 'collapse',
      type: 'collapse',
      children: [
        {
          name: '基础信息',
          children: [
            { name: '名称', field: 'f_Name' },
            { name: '编码', field: 'f_Code' },
            { name: '标签', field: 'f_Category' },
            { name: '备注', field: 'f_Description' },
          ],
        },
        {
          name: '排序字段',
          children: [
            {
              name: '排序字段',
              table: 'orders',
              children: [
                { name: '字段', field: 'field' },
                { name: '倒序', field: 'isDESC' },
              ],
            },
          ],
        },
        {
          name: '字段信息',
          children: [
            {
              name: '字段信息',
              table: 'fields',
              children: [{ name: '', field: 'name' }],
            },
          ],
        },
      ],
    },
  ],
};

const lookForm: FormAuthConfigType = {
  path: 'lookform',
  schema: [],
};

export default defineConfig<AppPageConfig>({
  title: '数据视图',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm, lookForm, codeForm, tableForm],
});
