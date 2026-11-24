import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '表名', prop: 'name', minWidth: 200, isKeyword: true },
  { label: '说明', prop: 'description', minWidth: 200, isKeyword: true },
];
const childColumns: ColumnType[] = [
  { label: '字段名', prop: 'dbColumnName', minWidth: 100 },
  { label: '类型', prop: 'dataType', width: 100 },
  { label: '长度', prop: 'length', width: 64, align: 'center' },
  { label: '主键', prop: 'isPrimarykey', width: 64, align: 'center' },
  { label: '允许为空', prop: 'isNullable', width: 80, align: 'center' },
  { label: '自增', prop: 'isIdentity', width: 64, align: 'center' },
  { label: '说明', prop: 'columnDescription', minWidth: 100 },
];

const buttons: ButtonType[] = [
  {
    prop: 'view',
    label: '查看',
    type: 'primary',
  },
];

export default defineConfig<AppPageConfig>({
  title: '数据表查看',
  columns: [{ list: columns }, { label: '字段表', id: 'child', list: childColumns }],
  buttons,
});
