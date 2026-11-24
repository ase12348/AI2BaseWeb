import { defHttp, useCURD } from '/@/core/utils/http/axios';

import module from '../module';

export interface mappingEntity {
  f_code: string;
  chinese: string; //中文
  traditionalchinese: string; //简体中文
  english: string; //英文
  japanese: string; //日
}

export interface dataitemEntity {
  f_Id: string;
  f_ItemId: string;
  f_ItemCode: string;
  f_ParentId: string;
  f_OperateTime: string;
  f_OperateAccount: string;
  f_OperateUserId: string;
  f_IPAddress: string;
  f_Module: string;
  f_ExecuteResult: string;
  f_ExecuteResultJson: string;
}

const urlPrefix = `${module.code}/mapping`;
const crud = useCURD<mappingEntity>(urlPrefix);
const getList = (mainCode, code) => {
  return defHttp.get(
    {
      url: `${urlPrefix}/${mainCode}/${code}`,
    },
    { withToken: false },
  );
};

const getDataItemList = (code: string) => {
  return defHttp.get({
    url: `${urlPrefix}/dataitems/${code}`,
  });
};
const getModuleList = (moduleId, isParent) => {
  return defHttp.get<mappingEntity[]>({ url: `${urlPrefix}/modules/${moduleId}/${isParent}` });
};

export const api = {
  ...crud,
  getList,
  getDataItemList,
  getModuleList,
};
