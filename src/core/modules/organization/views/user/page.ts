import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '姓名', prop: 'f_RealName', minWidth: 110, isKeyword: true },
  { label: '账号', prop: 'f_Account', minWidth: 110, isKeyword: true },
  { label: '手机', prop: 'f_Mobile', width: 108, isKeyword: true },
  // {
  //   label: '类别',
  //   prop: 'f_UserType',
  //   width: 80,
  //   align: 'center',
  //   isFilter: true,
  //   config: { dataType: 'dataItem', dataCode: 'usercategory', filteProp: 'userType' },
  // },
  { label: '公司', prop: 'f_CompanyId', width: 140, config: { dataType: 'company' } },
  {
    label: '部门',
    prop: 'f_DepartmentId',
    width: 140,
    config: { dataType: 'department' },
  },
  {
    label: '性别',
    prop: 'f_Gender',
    width: 80,
    align: 'center',
    isFilter: true,
    config: {
      filteProp: 'gender',
      options: [
        { label: '男', value: '1' },
        { label: '女', value: '0' },
      ],
    },
  },
  {
    label: '人员状态',
    prop: 'f_Type',
    width: 120,
    align: 'center',
    isFilter: true,
    config: {
      filteProp: 'type',
      options: [
        { label: '试用', value: '2' },
        { label: '正式', value: '1' },
        { label: '离职', value: '3' },
      ],
    },
  },
];

const buttons: ButtonType[] = [
  {
    prop: 'export',
    label: '导出',
    action: 'exportExcel',
    layerTitle: '用户数据导出',
    exportUrl: 'organization/user/page',
    classify: 'panel',
  },
  {
    prop: 'add',
    label: '新增',
    type: 'primary',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  { prop: 'edit', label: '编辑' },
  { prop: 'delete', label: '删除', danger: true },
  { prop: 'ResetPassword', label: '重置密码' },
];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [
    {
      id: 'tabs',
      name: '选项卡',
      type: 'tabs',
      children: [
        {
          name: '基础信息',
          config: { span: 12 },
          children: [
            {
              name: '账号',
              field: 'f_Account',
            },
            {
              name: '姓名',
              field: 'f_RealName',
            },
            {
              name: '公司',
              field: 'f_CompanyId',
            },
            {
              name: '部门',
              field: 'f_DepartmentId',
            },
            {
              name: '密码',
              field: 'f_Password',
            },
            {
              name: '生日',
              field: 'f_Birthday',
            },
            {
              name: '邮箱',
              field: 'f_Email',
            },
            {
              name: '手机',
              field: 'f_Mobile',
            },
            {
              name: '微信',
              field: 'f_WeChat',
            },
            {
              name: 'QQ',
              field: 'f_OICQ',
            },
            {
              name: '性别',
              field: 'f_Gender',
            },
            {
              name: '排序',
              field: 'f_SortCode',
            },
            /*{
              name: '绑定IP',
              field: 'f_BindIp',
            },*/

            {
              name: '人员状态',
              field: 'f_Type',
            },
            {
              name: '账号状态',
              field: 'f_EnabledMark',
            },
            {
              name: '开发人员',
              field: 'f_SecurityLevel',
            },

            {
              name: '描述',
              field: 'f_Description',
            },
          ],
        },
        {
          name: '角色信息',
          children: [
            {
              name: '',
              type: 'gridtable',
              table: 'formRoles',
              children: [
                {
                  name: '编号',
                  field: 'EnCode',
                },
                {
                  name: '名称',
                  field: 'FullName',
                },
              ],
            },
          ],
        },
        {
          name: '岗位信息',
          children: [
            {
              name: '',
              table: 'formPosts',
              type: 'gridtable',
              children: [
                {
                  name: '主次',
                  field: 'f_AttrCode',
                },
                {
                  name: '编号',
                  field: 'EnCode',
                },
                {
                  name: '公司',
                  field: 'Company',
                },
                {
                  name: '名称',
                  field: 'Name',
                },
              ],
            },
          ],
        },
        {
          name: '部门角色',
          children: [
            {
              name: '',
              table: 'formDepartments',
              type: 'gridtable',
              children: [
                {
                  name: '编号',
                  field: 'EnCode',
                },
                {
                  name: '名称',
                  field: 'Name',
                },
                {
                  name: '角色',
                  field: 'f_AttrCode',
                },
              ],
            },
          ],
        },
        {
          name: '公司角色',
          children: [
            {
              name: '',
              table: 'formCompanys',
              type: 'gridtable',
              children: [
                {
                  name: '编号',
                  field: 'EnCode',
                },
                {
                  name: '名称',
                  field: 'Name',
                },
                {
                  name: '角色',
                  field: 'f_AttrCode',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '用户管理',
  columns: [{ list: columns }],
  buttons,
  forms: [mainForm],
});
