import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface postEntity {
  f_Id: string;
  f_UserId: string;
  f_Category: number;
  f_Name: string;
  f_Type: number;
  f_ObjectId: string;
  f_CreateDate: string;
  f_TenantId: string;
}

const urlPrefix = `${module.code}/userRelation`;
const curd = useCURD<postEntity>(urlPrefix);
export const api = {
  ...curd,
  /**
   * @description: 获取角色或岗位成员
   */
  getList: (id: string) => {
    return defHttp.get<postEntity[]>({ url: `${urlPrefix}/${id}` });
  },
  save: (id: string, type: number, data: Record<string, any>) => {
    return defHttp.post({
      url: `${urlPrefix}/${type}/${id}`,
      data,
    });
  },
  saveRoles: (id: string, data: Record<string, any>) => {
    return defHttp.post({
      url: `${urlPrefix}/role/${id}`,
      data,
    });
  },
};
