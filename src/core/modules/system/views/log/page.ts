import type { AppPageConfig, ColumnType } from '/#/page';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '账号', prop: 'f_OperateAccount', isKeyword: true, width: 120 },
  {
    label: '姓名',
    prop: 'f_OperateName',
    isKeyword: true,
    width: 120,
  },
  {
    label: '类型',
    prop: 'f_CategoryId',
    width: 64,
    align: 'center',
    config: {
      dataType: 'options',
      options: [
        { label: '登录', value: 1 },
        { label: '访问', value: 2 },
        { label: '操作', value: 3 },
        { label: '文件下载', value: 5 },
        { label: '文件预览', value: 6 },
        { label: '任务', value: 10 },
        { label: '异常', value: 4 },
      ],
    },
  },
  { label: '时间', prop: 'f_OperateTime', width: 160, config: { dataType: 'dateTime' } },
  { label: '时长(ms)', prop: 'f_Times', width: 80, align: 'center' },

  { label: '请求接口', prop: 'f_Url', width: 200, isKeyword: true },
  { label: '请求类型', prop: 'f_OperateType', width: 80 },
  { label: '来源', prop: 'f_Device', isKeyword: true, align: 'center', width: 64 },
  { label: '浏览器', prop: 'f_Browser', width: 120 },
  { label: 'IP', prop: 'f_IPAddress', isKeyword: true, width: 120 },
  { label: 'IP地址', prop: 'f_IPAddressName', width: 160 },

  { label: '结果', prop: 'f_ExecuteResult', width: 72, align: 'center' },
  { label: '描述', prop: 'f_ExecuteResultJson', minWidth: 150 },
];

export default defineConfig<AppPageConfig>({
  title: '用户日志',
  columns: [{ list: columns }],
});
