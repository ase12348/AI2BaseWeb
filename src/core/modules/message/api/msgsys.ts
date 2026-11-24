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

const urlPrefix = `${module.code}/msg/sys`;
const crud = useCURD<msgEntity>(urlPrefix);

export const api = {
  ...crud,
  getSysNum: () => {
    return defHttp.get({
      url: `${urlPrefix}/num`,
    });
  },
};
