import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '编码', prop: 'f_EnCode', width: 164, isKeyword: true },
  { label: '名称', prop: 'f_FullName', minWidth: 160, isKeyword: true },
  { label: '当前流水号', prop: 'f_CurrentNumber', width: 184 },
  { label: '更新人', prop: 'f_ModifyUserName', width: 100, align: 'center' },
  {
    label: '最后更新',
    prop: 'f_ModifyDate',
    width: 160,
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
  { prop: 'edit', label: '编辑' },
  { prop: 'delete', label: '删除', danger: true },
];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [
    { name: '名称', field: 'f_FullName' },
    { name: '编码', field: 'f_EnCode' },
    { name: '说明', field: 'f_Description' },
    {
      name: '规则设置',
      table: 'ruleFormat',
      children: [
        { name: '前缀', field: 'itemType' },
        { name: '格式', field: 'formatStr' },
        { name: '步长', field: 'stepValue' },
        { name: '初始化值', field: 'initValue' },
      ],
    },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '单据编码',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
