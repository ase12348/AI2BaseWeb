import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';
import { providerOptions } from './options';

const columns: ColumnType[] = [
  {
    label: '提供商',
    prop: 'f_Provider',
    width: 160,
    isKeyword: true,
    config: { dataType: 'options', options: providerOptions },
  },
  { label: '模型', prop: 'f_Model', minWidth: 180, isKeyword: true },
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
    { name: '提供商', field: 'f_Provider' },
    { name: '模型', field: 'f_Model' },
    { name: 'API密钥', field: 'f_ApiKey' },
    { name: '接口地址', field: 'f_Url' },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '模型管理',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
