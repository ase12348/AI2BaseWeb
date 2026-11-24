import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface imgEntity {
  f_Id: string;
  f_FileName: string;
  f_FileExtensions: string;
  f_FileType: string;
  f_IsPublic: number;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_TenantId: string;
  f_CreateDateQRange: string;
}

const urlPrefix = `${module.code}/img`;
const crud = useCURD<imgEntity>(urlPrefix);

export const api = {
  ...crud,

  /**
   * @description: 上传
   */
  upload: (type, data) => {
    return defHttp.post({ url: `${urlPrefix}/upload/${type}`, data }, { errorMessageMode: 'none' });
  },
};
