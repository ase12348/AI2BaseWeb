import type { AppPageConfig, ColumnType } from '/#/page';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '账号', prop: 'account', isKeyword: true, minWidth: 120 },
  {
    label: '姓名',
    prop: 'name',
    isKeyword: true,
    minWidth: 120,
  },
  { label: 'IP', prop: 'ip', isKeyword: true, minWidth: 120 },
  { label: '浏览器', prop: 'browser', minWidth: 160 },
  { label: '来源', prop: 'device', isKeyword: true, align: 'center', width: 64 },
  { label: '登录时间', prop: 'loginTime', width: 160, config: { dataType: 'dateTime' } },
  { label: '最近请求时间', prop: 'time', width: 160, config: { dataType: 'dateTime' } },
];

export default defineConfig<AppPageConfig>({
  title: '在线用户',
  columns: [{ list: columns }],
});
