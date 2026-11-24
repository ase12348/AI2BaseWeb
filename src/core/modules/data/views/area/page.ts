import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_AreaName', minWidth: 100 },
  { label: '编号', prop: 'f_AreaCode', width: 100 },
  { label: '状态', prop: 'f_EnabledMark', width: 64, align: 'center' },
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
    { name: '上级', field: 'f_ParentId' },
    { name: '名称', field: 'f_AreaName' },
    { name: '编号', field: 'f_AreaCode' },
    { name: '状态', field: 'f_EnabledMark' },
    { name: '备注', field: 'f_Description' },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '行政区域',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
