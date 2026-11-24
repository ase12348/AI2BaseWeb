import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface departmentEntity {
  f_DepartmentId: string;
  f_CompanyId: string;
  f_ParentId: string;
  f_EnCode: string;
  f_FullName: string;
  f_ShortName: string;
  f_Nature: string;
  f_Manager: string;
  f_OuterPhone: string;
  f_InnerPhone: string;
  f_Email: string;
  f_Fax: string;
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
  f_Type: number;
  f_ParentName: string;
  f_ManagerId: string;
  f_PartyManagerId: string;
  f_ManagerIds: string;
  f_LeaderIds: string;
  f_DeptTag: string;
  f_OrdId: string;
  f_DingDepId: string;
  f_WechatDepId: string;
  f_TenantId: string;
  f_DeepNum: string;

  deptRoleList: string;
}

const urlPrefix = `${module.code}/department`;
const curd = useCURD<departmentEntity>(urlPrefix);
export const api = {
  ...curd,
  /**
   * @description: 获取部门信息
   */
  gets: (ids) => {
    return defHttp.post<departmentEntity[]>(
      { url: `${urlPrefix}s`, data: { ids } },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: 获取部门信息
   */
  getList: async (companyId, keyword?: string, parentId?: string, isSyn?: boolean) => {
    const list = await defHttp.get<departmentEntity[]>(
      { url: `${urlPrefix}s/${companyId}`, params: { keyword, isSyn } },
      { errorMessageMode: 'none' },
    );

    if (parentId) {
      const my = list.find((item) => item.f_DepartmentId === parentId);
      if (my) {
        const res = list.filter((item) => item.f_DeepNum.indexOf(my.f_DeepNum + '.') != -1);

        return [my, ...res];
      }
      return [];
    }

    return list;
  },
  syncData: (startTime: string) => {
    return defHttp.post(
      { url: `other/organizes/syncdepts`, params: { startTime: startTime } },
      { errorMessageMode: 'none' },
    );
  },
  getDepartments: (ids) => {
    return defHttp.post<departmentEntity[]>(
      { url: `${urlPrefix}s`, data: { ids } },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: 获取部门信息
   */
  getFullName: (id) => {
    return defHttp.get<string>({ url: `${urlPrefix}/name/${id}` }, { errorMessageMode: 'none' });
  },
};
