import { Pagination, PageResult } from '/#/axios';
import { defHttp } from '/@/core/utils/http/axios';
import module from '../module';

export interface logEntity {
  f_LogId: string; //主键
  f_OperateTime: string;
  f_OperateAccount: string; //用户
  f_OperateUserId: string; //姓名
  f_IPAddress: string;
  f_Module: string; //功能
  f_ExecuteResult: string; //结果
  f_ExecuteResultJson: string; //描述
}

const urlPrefix = `${module.code}/log`;
export const api = {
  /**
   * @description: 用户日志
   */
  getPage: (params: Pagination) => {
    return defHttp.get<PageResult<logEntity[]>>(
      { url: `${urlPrefix}/page`, params },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: visit
   */
  visit: (data) => {
    return defHttp.delete({ url: `${urlPrefix}`, data }, { errorMessageMode: 'none' });
  },
  /**
   * @description: 系统管理员日志
   */
  getAdminPage: (req) => {
    return defHttp.get(
      { url: `${urlPrefix}/adminpage`, params: req },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: 安全管理员日志
   */
  getSecurePage: (req) => {
    return defHttp.get(
      { url: `${urlPrefix}/securepage`, params: req },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: 审计员日志
   */
  getAuditPage: (req) => {
    return defHttp.get(
      { url: `${urlPrefix}/securepage`, params: req },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: 用户日志
   */
  getMyPage: (req) => {
    return defHttp.get({ url: `${urlPrefix}/my/page`, params: req }, { errorMessageMode: 'none' });
  },
};
