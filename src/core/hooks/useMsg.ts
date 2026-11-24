import { computed } from 'vue';
import { useMsgStore } from '@/core/store/message/msg';

export function useMsg() {
  const msgStore = useMsgStore();
  const getMsgMap = computed(() => msgStore.map);

  const addMsg = (msg: any) => {
    msgStore.add(msg);
  };

  return {
    getMsgMap,
    addMsg,
  };
}
