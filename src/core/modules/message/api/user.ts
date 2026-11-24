import { useCURD } from '/@/core/utils/http/axios';

import module from '../module';

export interface imSysUserEntity {
  f_Id: string;
  f_Name: string;
  f_Code: string;
  f_Icon: string;
  f_Colour: string;
  f_Url: string;
  f_AppUrl: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_Description: string;
  f_TenantId: string;
  f_IsEdit: number;
}

const urlPrefix = `${module.code}/user`;
const curd = useCURD<imSysUserEntity>(urlPrefix);

export const api = {
  ...curd,
};
