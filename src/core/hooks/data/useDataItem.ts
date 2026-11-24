import type { dataItemDetailEntity } from '/@/core/modules/data/api/dataitem';
import { computed } from 'vue';
import { useDataitemStore } from '@/core/store/data/dataitem';
import { toTree } from '@/core/utils/jcode';

export function useDataItem(codeList?: string[]) {
  const dataitemStore = useDataitemStore();

  if (codeList) {
    const len = codeList.length;
    for (let i = 0; i < len; i++) {
      dataitemStore.load(codeList[i]);
    }
  }

  const loadDataItemList = async (code: string, isCache: boolean = true) => {
    const res = await dataitemStore.load(code, isCache);
    return res;
  };
  const loadClassifyList = async (isCache: boolean = true) => {
    await dataitemStore.loadClassifys(isCache);
  };

  const clearDataItemList = (code: string) => {
    dataitemStore.clear(code);
  };

  const getDataItem = computed(() => {
    return dataitemStore.dic;
  });

  const getDataItemList = (code: string) => {
    return dataitemStore.dic[code] || [];
  };

  const getClassifys = computed(() => {
    return dataitemStore.classifys;
  });

  const getDataItemOptions = (
    list: dataItemDetailEntity[],
    valueKey?: string,
    labelKey?: string,
    keyword?: string,
    filterIds?: string[],
  ) => {
    list = list || [];
    if (keyword) {
      list = list.filter((item) => item.f_ItemName.indexOf(keyword) !== -1);
    }

    return toTree(
      list,
      'f_Id',
      'f_ParentId',
      valueKey || 'f_ItemValue',
      labelKey || 'f_ItemName',
      filterIds,
    ); // 转树
  };

  const getClassifysOptions = (valueKey?: string, keyword?: string, filterIds?: string[]) => {
    let list = dataitemStore.classifys || [];
    if (keyword) {
      list = list.filter((item) => item.f_ItemName.indexOf(keyword) !== -1);
    }
    return toTree(
      list,
      'f_ItemId',
      'f_ParentId',
      valueKey || 'f_ItemCode',
      'f_ItemName',
      filterIds,
    ); // 转树
  };

  return {
    getDataItem,
    getDataItemList,
    loadDataItemList,
    clearDataItemList,
    getDataItemOptions,

    getClassifys,
    loadClassifyList,
    getClassifysOptions,
  };
}
