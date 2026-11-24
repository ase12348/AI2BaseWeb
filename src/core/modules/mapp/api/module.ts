import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface functionEntity {
  f_Id: string;
  f_Type: string;
  f_FormCode: string;
  f_FormVerison: string;
  f_Icon: string;
  f_Color: string;
  f_Name: string;
  f_SchemeId: string;
  f_EnabledMark: number;
  f_SortCode: number;
  f_IsSystem: number;
  f_Url: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_TenantId: string;
  f_IsEdit: number;
  f_OldId: string;
  scheme: string;
}

const urlPrefix = `${module.code}/module`;
const crud = useCURD<functionEntity>(urlPrefix);
export const api = {
  ...crud,
  /**
   * @description: 获取数据
   */
  getList: () => {
    return defHttp.get<functionEntity[]>({ url: `${urlPrefix}s` }, { errorMessageMode: 'none' });
  },
  updateState: (id: string, state: number) => {
    return defHttp.put({
      url: `${urlPrefix}/${id}/${state}`,
    });
  },
  getChildren: (id: string, type: number) => {
    return defHttp.get({
      url: `${urlPrefix}/children/${type}/${id}`,
    });
  },
};
