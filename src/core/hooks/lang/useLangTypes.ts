import { computed } from 'vue';
import { useLangTypeStore } from '/@/core/store/language/type';

export const useLangTypes = () => {
  const typeStore = useLangTypeStore();

  const typeList = computed(() => {
    return typeStore.list;
  });

  return {
    typeList,
  };
};
