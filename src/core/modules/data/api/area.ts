import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface areaEntity {
  f_AreaId: string;
  f_ParentId: string;
  f_AreaCode: string;
  f_AreaName: string;
  f_QuickQuery: string;
  f_SimpleSpelling: string;
  f_Layer: number;
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

  hasChildren?: boolean;
}

const urlPrefix = `${module.code}/area`;
const crud = useCURD<areaEntity>(urlPrefix);

crud.getList = (pid: string) =>
  defHttp.get({
    url: `${urlPrefix}s/${pid}`,
  });

export const api = {
  ...crud,
};
