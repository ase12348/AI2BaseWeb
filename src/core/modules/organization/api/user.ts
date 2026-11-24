import type { ErrorMessageMode, Pagination, PageResult } from '/#/axios';

import { defHttp } from '/@/core/utils/http/axios';
import module from '../module';

/**
 * @description: 登录参数
 */
export interface LoginReq {
  account: string;
  password: string;

  /**
   * 租户信息
   */
  tenant?: {
    no?: string;
    name?: string;
    company?: string;
    token?: string;
  };
}

/**
 * @description: 登录返回数据
 */
export interface LoginRes {
  token: string;
  user: UserEntity;
}

/**
 * @description: 用户信息
 */
export interface UserEntity {
  /**
   * 用户主键
   */
  f_UserId: string;
  /**
   * 账户
   */
  f_Account: string;
  /**
   * 密码
   */
  f_Password: string;
  /**
   * 真实姓名
   */
  f_RealName: string;
  /**
   * 头像
   */
  f_HeadIcon: string;
  /**
   * 性别
   */
  f_Gender: number;
  /**
   * 生日
   */
  f_Birthday: string;
  /**
   * 手机
   */
  f_Mobile: string;
  /**
   * 电话
   */
  f_Telephone: string;
  /**
   * 电子邮件
   */
  f_Email: string;
  /**
   * QQ号
   */
  f_OICQ: string;
  /**
   * 微信号
   */
  f_WeChat: string;
  /**
   * MSN
   */
  f_MSN: string;
  /**
   * 公司主键
   */
  f_CompanyId: string;
  /**
   * 部门主键
   */
  f_DepartmentId: string;
  /**
   * 安全级别：1超级用户 5 开发人员
   */
  f_SecurityLevel: number;
  /**
   * 身份-用户密级(0公开，1内部，2秘密，3机密，4绝密)--ADD BY SSY 20230315
   */
  f_SecretLevel: number;
  /**
   * 身份-身份证号--ADD BY SSY 20230315
   */
  f_IdCard: string;
  /**
   * 身份-政治面貌--ADD BY SSY 20230315
   */
  f_Party: string;
  /**
   * 身份-行政职务--ADD BY SSY 20230315
   */
  f_Job: string;
  /**
   * 身份-行政职级--ADD BY SSY 20230315
   */
  f_Level: string;
  /**
   * 身份-职称等级--ADD BY SSY 20230315
   */
  f_Title: string;
  /**
   * 身份-技术职务--ADD BY SSY 20230315
   */
  f_Role: string;
  /**
   * 身份-管理职务--ADD BY SSY 20230315
   */
  f_Post: string;
  /**
   * 身份-职业技能--ADD BY SSY 20230315
   */
  f_WorkerDegree: string;
  /**
   * 全拼--ADD BY SSY 20230414
   */
  f_FullSpelling: string;
  /**
   * 简拼
   */
  f_SimpleSpelling: string;
  /**
   * 科室--ADD BY SSY 20230414
   */
  f_Room: string;
  /**
   * 排序码
   */
  f_SortCode: number;
  /**
   * 有效标志
   */
  f_EnabledMark: number;
  /**
   * 备注
   */
  f_Description: string;
  /**
   * 创建日期
   */
  f_CreateDate: string;
  /**
   * 创建用户主键
   */
  f_CreateUserId: string;
  /**
   * 创建用户
   */
  f_CreateUserName: string;
  /**
   * 修改日期
   */
  f_ModifyDate: string;
  /**
   * 修改用户主键
   */
  f_ModifyUserId: string;
  /**
   * 修改用户
   */
  f_ModifyUserName: string;

  /*
   *是否需要修改密码 1需要 2不需要
   */
  f_IsNeedChangePwd: number;

  /**
   * 同步后的企微用户ID
   */
  f_WechatUserId?: string;

  /**
   * 企微同步状态 1已同步 0未同步 -1企微不可用（organization/user/page 传 isSyn=true 时返回）
   */
  isWebchatSyn?: number;

  /**
   * 用户角色信息
   */
  roleIds?: string;
  /**
   * 用户岗位信息
   */
  postIds: string;

  /**
   * 功能权限id
   */
  moduleAuthIds?: string[];

  /**
   * 租户编码
   */
  tenantNo?: string;
  /**
   * 租户名称
   */
  tenantName?: string;
  /**
   * 租户公司
   */
  tenantCompany?: string;
}

const urlPrefix = `${module.code}/user`;
export const api = {
  /**
   * @description: 用户登录
   */
  login: (data: LoginReq, mode: ErrorMessageMode = 'modal') => {
    return defHttp.post<LoginRes>(
      {
        url: `login`,
        params: {
          tenantNo: data.tenant?.no,
          tenantName: data.tenant?.name,
          tenantCompany: data.tenant?.company,
          tenantTaken: data.tenant?.token,
        },
        data: {
          account: data.account,
          password: data.password,
        },
      },
      {
        errorMessageMode: mode,
        withToken: false,
      },
    );
  },
  /**
   * @description: 获取登录用户信息
   */
  getLoginInfo: () => {
    return defHttp.get<UserEntity>({ url: 'login/pc' }, { errorMessageMode: 'none' });
  },
  /**
   * @description: 获取分页数据
   */
  getPages: (pagination: Pagination) => {
    return defHttp.get<PageResult<UserEntity[]>>(
      { url: `${urlPrefix}/page`, params: { ...pagination } },
      { errorMessageMode: 'none' },
    );
  },
  updateState: (id: string, state: number) => {
    return defHttp.put({
      url: `${urlPrefix}/state/${id}`,
      params: { state },
    });
  },

  getUsers: (ids) =>
    defHttp.post({
      url: `${urlPrefix}s`,
      data: { ids },
    }),
  get: (id: string) => {
    return defHttp.get({
      url: `${urlPrefix}/${id}`,
    });
  },
  update: (id, data) => {
    return defHttp.put({
      url: `${urlPrefix}/${id}`,
      data,
    });
  },
  add: (data: Record<string, any>) => {
    return defHttp.post({
      url: `${urlPrefix}`,
      data,
    });
  },
  remove: (id) => {
    return defHttp.delete({
      url: `${urlPrefix}/${id}`,
    });
  },
  resetPassword: (id: string) => {
    return defHttp.put({
      url: `${urlPrefix}/resetpsw/${id}`,
    });
  },
  validatorPassword: (psw: string) => {
    return defHttp.get({
      url: `${urlPrefix}/validator/${psw}`,
    });
  },
  updatePassword: (req: Record<string, any>) => {
    return defHttp.put({
      url: `${urlPrefix}/password`,
      data: req,
    });
  },
  getRuleByRole: () => {
    return defHttp.get({
      url: `systemconfig/otherPasswordRule/byrole`,
    });
  },

  getheart: () => {
    return defHttp.get({
      url: `${urlPrefix}/heart`,
    });
  },
  getOnlines: (pagination: Pagination) => {
    return defHttp.get({
      url: `${urlPrefix}/onlines`,
      params: { ...pagination },
    });
  },
};
