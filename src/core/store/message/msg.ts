import { defineStore } from 'pinia';
import { store } from '/@/core/store';

interface StateType {
  map: Record<string, any>;
}

export const useMsgStore = defineStore('message-msg', {
  state: (): StateType => ({
    map: {},
  }),
  actions: {
    add(payload) {
      if (!this.map[payload.f_SendUserId]) {
        this.map[payload.f_SendUserId] = [];
      }
      this.map[payload.f_SendUserId].push(payload);
    },
  },
});

// Need to be used outside the setup
export function useMsgStoreWithOut() {
  return useMsgStore(store);
}
