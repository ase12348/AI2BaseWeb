import { defineStore } from 'pinia';
import { store } from '/@/core/store';
import { defHttp } from '/@/core/utils/http/axios';

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

  deptRoleList: string;
}

const urlPrefix = `organization/department`;
export const api = {
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
  getList: (companyId, keyword?: string) => {
    return defHttp.get<departmentEntity[]>(
      { url: `${urlPrefix}s/${companyId}`, params: { keyword } },
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

interface StateType {
  listDic: Record<string, departmentEntity[]>;
  oneDic: Record<string, departmentEntity>;
  fullNameDic: Record<string, string>;
  loadState: Record<string, boolean>;
}

let DepartmentLoadTimer; // 加载部门信息定时器
const DepartmentLoadings: string[] = []; // 需要加载的部门信息

export const useDepartmentStore = defineStore('organization-department', {
  state: (): StateType => ({
    listDic: {},
    oneDic: {},
    loadState: {},
    fullNameDic: {},
  }),
  actions: {
    async load(id: string) {
      if (!this.loadState[id]) {
        this.loadState[id] = true;
        DepartmentLoadings.push(id);
        // 50ms 内只执行一次
        if (DepartmentLoadings.length > 0 && !DepartmentLoadTimer) {
          DepartmentLoadTimer = setTimeout(async () => {
            DepartmentLoadTimer = null;
            if (DepartmentLoadings.length > 0) {
              const req = String(DepartmentLoadings);
              DepartmentLoadings.length = 0;
              const list = (await api.gets(req)) || [];
              list.forEach((item) => {
                this.oneDic[item.f_DepartmentId] = item;
              });
            }
          }, 50);
        }
      }
    },
    async loadList(companyId: string, isCache: boolean = true) {
      if (!this.loadState[companyId] || !isCache) {
        this.loadState[companyId] = true;
        const list = await api.getList(companyId, '');
        this.listDic[companyId] = list;
      }
    },
    async loadFullName(id: string) {
      if (!this.fullNameDic[id]) {
        const name = await api.getFullName(id);
        if (name) {
          this.fullNameDic[id] = name;
        }
      }
    },
  },
});

// Need to be used outside the setup
export function useDepartmentStoreWithOut() {
  return useDepartmentStore(store);
}
