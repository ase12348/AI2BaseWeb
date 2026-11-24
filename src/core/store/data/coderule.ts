import { defineStore } from 'pinia';
import { store } from '/@/core/store';

import { useCURD } from '/@/core/utils/http/axios';

export interface coderuleRoleEntity {
  f_RuleId: string;
  f_EnCode: string; //编码
  f_FullName: string; //名称
  f_CurrentNumber: string; //当前流水号
  f_DeleteMark: number; //删除标志
  f_EnabledMark: number; //有效标志
  f_Description: string; //描述
  f_CreateUserName: string; //创建人
  f_CreateDate: string; //创建时间
  f_ModifyDate: string; //修改时间
  f_ModifyUserName: string; //修改人
  f_ModifyUserId: string; //修改人Id
  f_RuleFormatJson: string; //标签
}

const urlPrefix = `data/coderule`;
const crud = useCURD<coderuleRoleEntity>(urlPrefix);

export const api = {
  ...crud,
};

interface StateType {
  loadState: Record<string, boolean>;
  dic: Record<string, coderuleRoleEntity>;
}

export const useCoderuleStore = defineStore('data-coderule', {
  state: (): StateType => ({
    loadState: {},
    dic: {},
  }),
  getters: {},
  actions: {
    async load(code: string, isCache: boolean = true) {
      if (code && (!this.loadState[code] || !isCache)) {
        this.loadState[code] = true;
        const data = await api.get(code);
        this.dic[code] = data;
      }
    },
  },
});

// Need to be used outside the setup
export function useCoderuleStoreWithOut() {
  return useCoderuleStore(store);
}
