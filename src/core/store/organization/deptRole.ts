import { defineStore } from 'pinia';
import { store } from '/@/core/store';
import { useCURD } from '/@/core/utils/http/axios';

export interface deptRoleEntity {
  fId: string;
  fCode: string;
  fName: string;
  fCategory: string;
  fEnabledMark: number;
  fSortCode: number;
  fDes: string;
  fCreateDate: string;
  fCreateUserId: string;
  fCreateUserName: string;
  fModifyDate: string;
  fModifyUserId: string;
  fModifyUserName: string;
  fTenantId: string;
}

const urlPrefix = `organization/deptRole`;
const curd = useCURD<deptRoleEntity>(urlPrefix);
export const api = {
  ...curd,
};

interface StateType {
  list: deptRoleEntity[];
}

export const useDeptRoleStore = defineStore('organization-deptrole', {
  state: (): StateType => ({
    list: [],
  }),
  actions: {
    async loadList() {
      this.list = await api.getList();
      // console.log(this.list, 'this.list');
    },
  },
});

// Need to be used outside the setup
export function useDeptRoleStoreWithOut() {
  return useDeptRoleStore(store);
}
