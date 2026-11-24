import { useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface deptRoleEntity {
  fId: string;
  fCode: string;
  fName: string;
  fCategory: string;
  fEnabledMark: number;
  fSortCode: number;
  fDes: string;
  fCreateDate: string;
  fCreateUserId: string;
  fCreateUserName: string;
  fModifyDate: string;
  fModifyUserId: string;
  fModifyUserName: string;
  fTenantId: string;
}

const urlPrefix = `${module.code}/deptRole`;
const curd = useCURD<deptRoleEntity>(urlPrefix);
export const api = {
  ...curd,
};
