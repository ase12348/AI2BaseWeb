import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface companyEntity {
  // 公司ID
  f_CompanyId: string;
  // 创建时间
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_DeleteMark: number;
  f_DeptTag: string;
  f_Description: string;
  f_DingAgentId: string;
  f_DingAppKey: string;
  f_DingAppSecret: string;
  f_EnCode: string;
  f_EnabledMark: number;
  f_FullName: string;
  f_InnerPhone: string;
  f_LeaderIds: string;
  f_Manager: string;
  f_ManagerId: string;
  f_ManagerIds: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_ParentId: string;
  f_ShortName: string;
  f_SortCode: string;
  f_TenantId: string;
  [typeName: string]: any;
}

const urlPrefix = `${module.code}/company`;
const curd = useCURD<companyEntity>(urlPrefix);
export const api = {
  ...curd,
  syncData: () => {
    return defHttp.post({ url: `other/organizes/synccompany` });
  },
};
