import { dataItemDetailEntity, dataitemEntity, api } from '/@/core/modules/data/api/dataitem';
import { defineStore } from 'pinia';
import { store } from '/@/core/store';
import { t } from '/@/core/locales/setupI18n';

interface StateType {
  dic: Record<string, dataItemDetailEntity[]>;
  loadState: Record<string, boolean>;
  loadClassifysState: Boolean;
  classifys: dataitemEntity[];
}

export const useDataitemStore = defineStore('data-dataitem', {
  state: (): StateType => ({
    dic: {},
    loadState: {},
    loadClassifysState: false,
    classifys: [],
  }),
  getters: {},
  actions: {
    async load(code: string, isCache: boolean = true) {
      if (!code) {
        return [];
      }
      if (!this.loadState[code] || !isCache) {
        this.loadState[code] = true;
        const list = (await api.getDetails(code)) || [];
        this.dic[code] = list
          .filter((t) => t.f_EnabledMark == 1)
          .map((item) => ({ ...item, f_ItemName: t(item.f_ItemName) }));
      }

      return this.dic[code] || [];
    },
    async loadClassifys(isCache: boolean = true) {
      if (!this.loadClassifysState || !isCache) {
        this.loadClassifysState = true;
        const data = await api.getClassifys();
        this.classifys = data;
      }
    },

    clear(code: string) {
      this.loadState[code] = false;
    },
  },
});

// Need to be used outside the setup
export function useDataitemStoreWithOut() {
  return useDataitemStore(store);
}
