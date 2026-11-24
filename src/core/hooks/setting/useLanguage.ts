import { computed, onMounted } from 'vue';
import { useLangTypeStore } from '/@/core/store/language/type';
import { useLangMappingStore } from '/@/core/store/language/mapping';

export function useLanguage() {
  const langTypeStore = useLangTypeStore();
  const langMappingStore = useLangMappingStore();

  const getCurrentType = computed(() => langTypeStore.getCurrentType);
  const getTypeList = computed(() => langTypeStore.list);
  const antdLocale = computed(() => langMappingStore.antdLocale);

  const setCurrentType = (type: string) => {
    langTypeStore.setCurrentType(type);
    location.reload();
  };

  const loadList = async () => {
    // 加载语言
    await langTypeStore.loadList();
  };

  onMounted(() => {
    if (getTypeList.value.length === 0) {
      loadList();
    }
  });

  return {
    loadList,
    getTypeList,
    getCurrentType,
    setCurrentType,
    antdLocale,
  };
}
