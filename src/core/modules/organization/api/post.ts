import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface postEntity {
  f_CompanyId: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_DeleteMark: number;
  f_DepartmentId: string;
  f_Description: string;
  f_EnCode: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_Name: string;
  f_ParentId: string;
  f_PostId: string;
  f_TenantId: string;
  companyName: string;
  deptName: string;
}

const urlPrefix = `${module.code}/post`;
const curd = useCURD<postEntity>(urlPrefix);
export const api = {
  ...curd,
  /**
   * @description: 获取公司信息列表
   */
  getList: (params: Record<string, any>) => {
    return defHttp.get<postEntity[]>(
      { url: `${urlPrefix}s`, params },
      { errorMessageMode: 'none' },
    );
  },
  gets: (ids: string) => {
    return defHttp.post<postEntity[]>({ url: `${urlPrefix}s`, data: { ids } });
  },
};
