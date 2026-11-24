import { useCURD, defHttp } from '/@/core/utils/http/axios';
import module from '../module';

export interface msgEntity {
  f_MsgId: string;
  f_SendUserId: string;
  f_RecvUserId: string;
  f_Content: string;
  f_CreateDate: string;
  f_IsSystem: number;
  f_IsRead: number;
  f_DeleteMark: number;
  f_ContentId: string;
  f_TenantId: string;
}

const urlPrefix = `${module.code}/msg`;
const crud = useCURD<msgEntity>(urlPrefix);

export const api = {
  ...crud,
  clear: () => {
    return defHttp.delete({
      url: `${urlPrefix}/clear`,
    });
  },
  virtualDelete: (params) => {
    return defHttp.delete({
      url: `${urlPrefix}/virtual`,
      params,
    });
  },
  thoroughDelete: (params) => {
    return defHttp.delete({
      url: `${urlPrefix}`,
      params,
    });
  },
  read: (id) => {
    return defHttp.put({ url: `${urlPrefix}/read/${id}` });
  },
};
