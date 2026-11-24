import { defineStore } from 'pinia';
import { store } from '/@/core/store';
import { useCURD } from '/@/core/utils/http/axios';

const urlPrefix = `organization/company`;
const curd = useCURD<companyEntity>(urlPrefix);
export const api = {
  ...curd,
};
export interface companyEntity {
  // 公司
  f_CompanyId: string;
  f_FullName: string;
  f_ParentId: string;
  [typeName: string]: any;
}
interface StateType {
  list: companyEntity[];
}

export const useCompanyStore = defineStore('organization-company', {
  state: (): StateType => ({
    list: [],
  }),
  getters: {
    getList(state): companyEntity[] {
      return state.list;
    },
  },
  actions: {
    async load(isCache: boolean = false) {
      if (this.list.length === 0 || !isCache) {
        this.list = (await api.getList()) || [];
      }
      return this.list;
    },
    async add(entity: companyEntity) {
      const res = await api.add(entity);
      if (res) {
        await this.load();
      }
      return res;
    },
    async update(id: string, entity: companyEntity) {
      const res = await api.update(id, entity);
      if (res) {
        await this.load();
      }
      return res;
    },
    async remove(id: string) {
      const res = await api.remove(id);
      if (res) {
        await this.load();
      }
      return res;
    },
    async get(id: string) {
      return await api.get(id);
    },
  },
});

// Need to be used outside the setup
export function useCompanyStoreWithOut() {
  return useCompanyStore(store);
}
