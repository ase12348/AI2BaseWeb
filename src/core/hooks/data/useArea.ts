import type { areaEntity } from '@/core/modules/data/api/area';
import { computed } from 'vue';
import { useAreaStore } from '/@/core/store/data/area';

export function useArea() {
  const areaStore = useAreaStore();

  const loadAreaList = async (pid: string, isCache: boolean = true) => {
    return await areaStore.load(pid, isCache);
  };

  const clearAreaList = (pid: string) => {
    areaStore.clear(pid);
  };

  const getArea = computed(() => {
    return areaStore.dic;
  });

  const getAreaOptions = (list: areaEntity[], level?: number) => {
    list = list || [];
    return list.map((t) => ({
      ...t,
      value: t.f_AreaCode,
      label: t.f_AreaName,
      isLeaf: t.f_Layer === level || t.f_Layer === 4,
    }));
  };

  return {
    getArea,
    loadAreaList,
    clearAreaList,
    getAreaOptions,
  };
}
