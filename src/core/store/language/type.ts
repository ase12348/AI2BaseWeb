import { Persistent } from '/@/core/utils/cache/persistent';
import { defineStore } from 'pinia';
import { store } from '/@/core/store';
import { LOCALE_TYPE_KEY } from '/@/core/enums/cacheEnum';
import { useGlobSetting } from '/@/core/hooks/setting';
import { defHttp } from '/@/core/utils/http/axios';

export interface LgTypeEntity {
  f_Id: string;
  f_Name: string;
  f_Code: string;
  f_IsMain: number;
}

const urlPrefix = `language/type`;
export const api = {
  getList: () =>
    defHttp.get<LgTypeEntity[]>(
      {
        url: `${urlPrefix}s`,
      },
      { withToken: false },
    ),
};

const { options: webCofing } = useGlobSetting();
interface StateType {
  list: LgTypeEntity[];
  current: string | undefined;
}

export const useLangTypeStore = defineStore('language-type', {
  state: (): StateType => ({
    list: [],
    current: undefined,
  }),
  getters: {
    getCurrentType(state): string {
      const type = state.current || Persistent.getLocal(LOCALE_TYPE_KEY) || webCofing.language.type;
      return type;
    },
    getMainType(): string {
      return webCofing.language.mainType;
    },
  },
  actions: {
    async loadList() {
      const list = await api.getList();
      this.list = list || [];
    },
    setCurrentType(type: string) {
      this.current = type;
      Persistent.setLocal(LOCALE_TYPE_KEY, type);
    },
  },
});

// Need to be used outside the setup
export function useLangTypeStoreWithOut() {
  return useLangTypeStore(store);
}
