import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface iconEntity {
  f_Id: string;
  f_Height: number;
  f_Width: number;
  f_Name: string;
  f_Code: string;
  f_Category: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_Body: string;
}

const urlPrefix = `${module.code}/icon`;
const crud = useCURD<iconEntity>(urlPrefix);

export const api = {
  ...crud,
  getList: (ver: string) => {
    return defHttp.get<{ ver: string; list: iconEntity[] }>(
      {
        url: `${urlPrefix}s`,
        params: { ver },
      },
      { withToken: false },
    );
  },
};
