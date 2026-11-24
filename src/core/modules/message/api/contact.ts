import { useCURD, defHttp } from '/@/core/utils/http/axios';
import module from '../module';

export interface msgEntity {
  f_Id: string;
  f_MyUserId: string;
  f_OtherUserId: string;
  f_Content: string;
  f_Time: string;
  f_NoReadNum: number;
  f_TenantId: string;
}
const urlPrefix = `${module.code}/contact`;
const crud = useCURD<msgEntity>(urlPrefix);

export const api = {
  ...crud,
  /**
   * @description: 获取联系人列表
   */
  addList: (data) => {
    return defHttp.post({ url: `${urlPrefix}s`, data }, { errorMessageMode: 'none' });
  },
  /**
   * @description: updateState
   */
  updateState: (id) => {
    return defHttp.put({ url: `${urlPrefix}/state/${id}` }, { errorMessageMode: 'none' });
  },
};
