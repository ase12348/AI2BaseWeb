import { defHttp } from '/@/core/utils/http/axios';
import module from '../module';

const urlPrefix = `${module.code}/export`;

export const api = {
  /**
   * @description: down
   */
  down: (data: any) => {
    return defHttp.post({ url: `${urlPrefix}/file`, data }, { errorMessageMode: 'none' });
  },
};
