import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '名称', prop: 'f_DBAlias', minWidth: 150, isKeyword: true },
  { label: '编码', prop: 'f_DBName', minWidth: 150, isKeyword: true },
  { label: '类型', prop: 'f_DbType', width: 80, align: 'center', isKeyword: true },
  { label: '数据库地址', prop: 'f_ServerAddress', width: 200, isKeyword: true },
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
    {
      name: '名称',
      field: 'f_DBAlias',
    },
    {
      name: '编码',
      field: 'f_DBName',
    },
    {
      name: '类型',
      field: 'f_DbType',
    },
    {
      name: '说明',
      field: 'f_Description',
    },
    {
      id: 'f_Type',
      name: '选项卡',
      type: 'tabs',
      children: [
        {
          name: '常规',
          children: [
            {
              name: '主机',
              field: 'f_Server',
            },
            {
              name: '端口',
              field: 'f_Port',
            },
            {
              name: '用户名',
              field: 'f_UserId',
            },
            {
              name: '密码',
              field: 'f_Password',
            },
            {
              name: '数据库',
              field: 'f_DataBase',
            },
          ],
        },
        {
          name: '高级',
          children: [
            {
              name: '连接串',
              field: 'f_DbConnection',
            },
          ],
        },
      ],
    },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '数据库连接',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
