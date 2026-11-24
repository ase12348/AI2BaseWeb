import { useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface roleEntity {
  f_RoleId: string;
  f_Category: string;
  f_EnCode: string;
  f_FullName: string;
  f_SortCode: number;
  f_DeleteMark: number;
  f_EnabledMark: number;
  f_Description: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_TenantId: string;
}

const urlPrefix = `${module.code}/role`;
const curd = useCURD<roleEntity>(urlPrefix);
export const api = {
  ...curd,
};
