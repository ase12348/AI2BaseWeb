import { defHttp } from '/@/core/utils/http/axios';
import module from '../module';

const urlPrefix = `${module.code}`;

export const api = {
  /**
   * @description: 移除系统缓存
   */
  removeCache: () => {
    return defHttp.post({ url: `${urlPrefix}/cache` }, { errorMessageMode: 'none' });
  },
};
