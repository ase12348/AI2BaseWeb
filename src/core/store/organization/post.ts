import { defineStore } from 'pinia';
import { store } from '/@/core/store';

import { defHttp } from '/@/core/utils/http/axios';

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

const urlPrefix = `organization/post`;
export const api = {
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

interface StateType {
  listDic: Record<string, postEntity[]>;
  oneDic: Record<string, postEntity>;
  loadState: Record<string, boolean>;
}

let PostLoadTimer; // 加载用户信息定时器
const PostLoadings: string[] = []; // 需要加载的用户信息

export const usePostStore = defineStore('organization-post', {
  state: (): StateType => ({
    listDic: {},
    oneDic: {},
    loadState: {},
  }),
  actions: {
    async load(id: string) {
      if (!this.loadState[id]) {
        this.loadState[id] = true;
        PostLoadings.push(id);
        // 50ms 内只执行一次
        if (PostLoadings.length > 0 && !PostLoadTimer) {
          PostLoadTimer = setTimeout(async () => {
            PostLoadTimer = null;
            if (PostLoadings.length > 0) {
              const req = String(PostLoadings);
              PostLoadings.length = 0;
              const list = (await api.gets(req)) || [];
              list.forEach((item) => {
                this.oneDic[item.f_PostId] = item;
              });
            }
          }, 50);
        }
      }
    },
    async loadList(companyId: string, isCache: boolean = true) {
      if (!this.loadState[companyId] || !isCache) {
        this.loadState[companyId] = true;
        const list = await api.getList({ companyId });
        this.listDic[companyId] = list;
      }
    },
  },
});

// Need to be used outside the setup
export function usePostStoreWithOut() {
  return usePostStore(store);
}
