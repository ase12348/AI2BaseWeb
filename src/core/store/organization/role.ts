import { defineStore } from 'pinia';
import { store } from '/@/core/store';
import { useCURD } from '/@/core/utils/http/axios';

export interface roleEntity {
  f_RoleId: string;
  f_Category: string;
  f_EnCode: string;
  f_FullName: string;
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
  f_TenantId: string;
}

const urlPrefix = `organization/role`;
const curd = useCURD<roleEntity>(urlPrefix);
export const api = {
  ...curd,
};

interface StateType {
  list?: roleEntity[];
  oneDic: Record<string, roleEntity>;
  loadState: Record<string, boolean>;
}

export const useRoleStore = defineStore('organization-role', {
  state: (): StateType => ({
    loadState: {},
    list: undefined,
    oneDic: {},
  }),
  actions: {
    async loadList(isCache: boolean = true) {
      if (this.list === undefined || !isCache) {
        this.list = [];
        this.list = await api.getList();
      }
      return this.list || [];
    },
    async load(roleId: string, isCache: boolean = true) {
      if (!this.loadState[roleId] || !isCache) {
        this.loadState[roleId] = true;
        const list = await api.get(roleId);
        this.oneDic[roleId] = list;
      }
    },
  },
});

// Need to be used outside the setup
export function useRoleStoreWithOut() {
  return useRoleStore(store);
}
