import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

const urlPrefix = `${module.code}/module`;
const curd = useCURD(urlPrefix);
export const api = {
  ...curd,
  /**
   * @description: 获取数据权限对应关系数据列表
   */
  getList: (id: string, type: number, parentId: string) => {
    return defHttp.get({
      url: `${urlPrefix}/${type}/${parentId}/${id}`,
    });
  },
  save: (id: string, data: Record<string, any>) => {
    return defHttp.post({
      url: `${urlPrefix}/${id}`,
      data: data,
    });
  },
  get: (id: string, name: string) => {
    return defHttp.get({
      url: `${urlPrefix}/${id}`,
      params: { name },
    });
  },
};
