import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface dataAuthEntity {
  f_Id: string;
  f_Name: string;
  f_Code: string;
  f_Type: number;
  f_ObjectId: string;
  f_ObjectType: number;
  f_Formula: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_TenantId: string;
  [typeName: string]: any;
}

const urlPrefix = `${module.code}/data`;
const curd = useCURD<dataAuthEntity>(urlPrefix);
export const api = {
  ...curd,
  remove: (dataId) => {
    return defHttp.delete({
      url: `${urlPrefix}/${dataId}`,
    });
  },
};
