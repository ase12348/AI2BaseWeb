import { ErrorTypeEnum } from '/@/core/enums/exceptionEnum';
// Error-log information
export interface ErrorLogInfo {
  // Type of error
  type: ErrorTypeEnum;
  // Error file
  file: string;
  // Error name
  name?: string;
  // Error message
  message: string;
  // Error stack
  stack?: string;
  // Error detail
  detail: string;
  // Error url
  url: string;
  // Error time
  time?: string;
}

/**
 * 登录者信息
 */
export interface LoginInfo {
  // id
  id?: string;
  // 名称
  name?: string;
  // 帐号
  account?: string;
  // 头像
  avatar?: string;
  // 所属角色
  roleIds?: string[];
  // 所属岗位
  postIds?: string[];
  // 当前岗位
  postId?: string;
  // 所属公司
  companyId?: string;
  // 所属部门
  departmentId?: string;
  // 描述
  desc?: string;
  // 账号类型 管理员，1超级用户 2三员-系统管理员、3三员-安全管理员、4三员-审计员
  securityLevel?: number;
  // 密级
  secretLevel?: number;
  // 性别
  gender?: number;
  // 租户号
  tenantNo?: string;
  // 租户
  tenantName?: string;
  // 租户公司
  tenantCompany?: string;
  // 备注
  description?: string;
  // 手机
  f_Mobile?: string;
  // 电话
  f_Telephone?: string;
  // 邮箱
  f_Email?: string;
  // 微信
  f_WeChat?: string;
  // QQ
  f_OICQ?: string;
  // 模块权限
  moduleAuthIds: string[];
  // 是否是管理员
  isAdmin: boolean;

  // 需要修改密码
  isNeedChangePwd: boolean;
}
