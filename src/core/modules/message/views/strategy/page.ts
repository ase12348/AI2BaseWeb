import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_StrategyName', minWidth: 140, isKeyword: true },
  { label: '编码', prop: 'f_StrategyCode', minWidth: 110, isKeyword: true },
  { label: '类型', prop: 'f_MessageType', width: 150, isKeyword: true },
  { label: '备注', prop: 'f_Description', minWidth: 300, isKeyword: true },
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
    { name: '名称', field: 'f_StrategyName' },
    { name: '编码', field: 'f_StrategyCode' },
    { name: '类型', field: 'f_MessageType' },
    { name: '模板', field: 'f_Template' },
    { name: '备注', field: 'f_Description' },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '消息策略',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
