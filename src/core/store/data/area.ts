import { defineStore } from 'pinia';
import { store } from '/@/core/store';

import { defHttp } from '/@/core/utils/http/axios';

export interface areaEntity {
  f_AreaId: string;
  f_ParentId: string;
  f_AreaCode: string;
  f_AreaName: string;
  f_QuickQuery: string;
  f_SimpleSpelling: string;
  f_Layer: number;
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

  hasChildren?: boolean;
}

const urlPrefix = `data/area`;

export const api = {
  getList: (pid: string) =>
    defHttp.get<areaEntity[]>({
      url: `${urlPrefix}s/${pid}`,
    }),
};

interface StateType {
  dic: Record<string, areaEntity[]>;
  loadState: Record<string, boolean>;
}

export const useAreaStore = defineStore('data-area', {
  state: (): StateType => ({
    dic: {},
    loadState: {},
  }),
  getters: {},
  actions: {
    async load(pid: string, isCache: boolean = true) {
      if (!this.loadState[pid] || !this.dic[pid] || !isCache) {
        this.loadState[pid] = true;
        const list = (await api.getList(pid)) || [];
        list.forEach((item) => {
          if (item.f_Layer != 4) {
            item.hasChildren = true;
          }
        });
        this.dic[pid] = list;
      }
      return this.dic[pid];
    },
    clear(pid: string) {
      this.loadState[pid] = false;
    },
  },
});

// Need to be used outside the setup
export function useAreaStoreWithOut() {
  return useAreaStore(store);
}
