import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface configEntity {
  f_Id: string;
  f_Content: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_TenantId: string;
}

const urlPrefix = `${module.code}/configcommon`;
const curd = useCURD<configEntity>(urlPrefix);
export const api = {
  ...curd,
  getconfig: (id) => {
    return defHttp.get<configEntity>({ url: `${urlPrefix}/${id}` });
  },
  saveLoginConfig: (data) => {
    return defHttp.post<configEntity>({ url: `${urlPrefix}/login`, data });
  },
  SavePwdConfig: (data) => {
    return defHttp.post<configEntity>({ url: `${urlPrefix}/pwd`, data });
  },
  saveSmsConfig: (data) => {
    return defHttp.post<configEntity>({ url: `${urlPrefix}/sms`, data });
  },
  sendTestSms: (data) => {
    return defHttp.post<string>({ url: `${urlPrefix}/sms/test`, data });
  },
};
