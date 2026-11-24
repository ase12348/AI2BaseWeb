import { defineStore } from 'pinia';
import { store } from '/@/core/store';
import { useCURD } from '/@/core/utils/http/axios';

export interface dblinkEntity {
  f_Id: string;
  f_DBAlias: string; //名称
  f_DBName: string; //编码
  f_DbType: string; //类型
  f_ServerAddress: string; //数据库地址
  f_Description: string; //描述
}

const urlPrefix = `data/dblink`;
const crud = useCURD<dblinkEntity>(urlPrefix);

export const api = {
  /**
   * @description: 获取配置记录
   */
  ...crud,
};

interface StateType {
  list: dblinkEntity[];
  loadState: boolean;
}

export const useDblinkStore = defineStore('data-dblink', {
  state: (): StateType => ({
    list: [],
    loadState: false,
  }),
  getters: {},
  actions: {
    async load(isCache: boolean = true) {
      if (!this.loadState || !isCache) {
        this.loadState = true;
        const list = (await api.getList()) || [];
        this.list = list;
      }
      return this.list;
    },
    clear() {
      this.loadState = false;
    },
  },
});

// Need to be used outside the setup
export function useDblinkStoreWithOut() {
  return useDblinkStore(store);
}
