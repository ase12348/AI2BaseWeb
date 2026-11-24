import type { AppPageConfig, ColumnType, ButtonType } from '/#/page';
import { defineConfig } from '/@/core/utils';

const columns: ColumnType[] = [
  { label: '姓名', prop: 'f_RealName', minWidth: 110, isKeyword: true },
  { label: '账号', prop: 'f_Account', width: 110, isKeyword: true },
  { label: '手机', prop: 'f_Mobile', width: 108, isKeyword: true },
  {
    label: '公司',
    prop: 'f_CompanyId',
    width: 120,
    isFilter: true,
    config: {
      filteProp: 'companyId',
      dataType: 'company',
    },
  },
  {
    label: '部门',
    prop: 'f_DepartmentId',
    width: 140,
    isFilter: true,
    config: { dataType: 'department', filteProp: 'departmentId', upId: 'f_CompanyId' },
  },
  { label: '性别', prop: 'f_Gender', width: 80, align: 'center' },
];

const buttons: ButtonType[] = [
  {
    prop: 'add',
    label: '新增',
    type: 'primary',
    classify: 'panel',
    icon: 'ant-design:plus-outlined',
  },
  { prop: 'delete', label: '删除', danger: true },
];
export default defineConfig<AppPageConfig>({
  title: '黑名单管理',
  columns: [{ list: columns }],
  buttons,
});
