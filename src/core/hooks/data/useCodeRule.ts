import { computed } from 'vue';
import { useCoderuleStoreWithOut } from '/@/core/store/data/coderule';

export function useCodeRule() {
  const coderuleStore = useCoderuleStoreWithOut();

  const load = async (code: string, isCache = true) => {
    await coderuleStore.load(code, isCache);
  };

  const get = computed(() => {
    return coderuleStore.dic;
  });

  return {
    loadCodeRule: load,
    getCodeRule: get,
  };
}
