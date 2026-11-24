import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_Name', minWidth: 150, isKeyword: true },
  { label: '状态', prop: 'f_IsActive', width: 72, align: 'center' },
  { label: '开始时间', prop: 'f_BeginTime', width: 160, config: { dataType: 'dateTime' } },
  { label: '结束时间', prop: 'f_EndTime', width: 160, config: { dataType: 'dateTime' } },
  { label: '运行状态', prop: 'f_RunActive', width: 80, align: 'center' },
  { label: '检测时间', prop: 'f_RunTestTime', width: 160 },
  {
    label: '创建人',
    prop: 'f_CreateUserId',
    width: 100,
    align: 'center',
    config: { dataType: 'user' },
  },
  {
    label: '创建时间',
    prop: 'f_CreateDate',
    width: 160,
    align: 'center',
    config: { dataType: 'dateTime' },
  },
  {
    label: '修改人',
    prop: 'f_ModifyUserId',
    width: 100,
    align: 'center',
    config: { dataType: 'user' },
  },
  {
    label: '修改时间',
    prop: 'f_ModifyDate',
    width: 160,
    align: 'center',
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
  schema: [],
};

export default defineConfig<AppPageConfig>({
  title: '任务设计',
  columns: [{ list: columns }],
  forms: [mainForm],
  buttons,
});
