import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '内容', prop: 'f_Content', minWidth: 120, align: 'left', isKeyword: true },
  { label: '消息类型', prop: 'f_SendUserId', width: 120, align: 'left', isKeyword: true },
  { label: '状态', prop: 'f_IsRead', width: 64, align: 'center', isKeyword: true },
  {
    label: '时间',
    prop: 'f_CreateDate',
    width: 160,
    align: 'left',
    isKeyword: true,
    config: { dataType: 'dateTime' },
  },
];

const buttons: ButtonType[] = [
  {
    prop: 'delete',
    label: '删除 ',
    type: 'primary',
    danger: true,
    classify: 'panel',
  },
];

export default defineConfig<AppPageConfig>({
  title: '消息中心',
  columns: [{ list: columns }],
  buttons,
});
