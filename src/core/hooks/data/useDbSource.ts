import { computed, ref } from 'vue';
import { useDbSourceStore } from '/@/core/store/data/dbsource';
import { useDataItem } from '/@/core/hooks/data/useDataItem';
import { api } from '/@/core/modules/data/api/dbsource';
import { toTree } from '@/core/utils/jcode';
import { api as apiModule } from '@/core/modules/mapp/api/module';

export function useDbSource() {
  const dbSourceStore = useDbSourceStore();
  const { loadDataItemList, getDataItem } = useDataItem();

  const loadDbSourceList = async (
    code: string,
    params?: Record<string, any>,
    isCache: boolean = true,
  ) => {
    await dbSourceStore.loadList(code, params, isCache);
  };
  const getDbSourceList = computed(() => {
    return dbSourceStore.dic;
  });

  const dbSourceListByFormatter = ref<Record<string, any>>({});
  const loadDbSourceListByFormatter = async ({
    code,
    params,
    isCache,
    formatter,
    executeEvent,
  }: {
    code: string;
    params?: Record<string, any>;
    isCache;
    formatter?: string;
    executeEvent?: (formatter: string, params: Record<string, any>) => any;
  }) => {
    if (isCache) {
      return;
    }
    await loadDbSourceList(code, params, isCache);
    const list: Record<string, any>[] = getDbSourceList.value[code];
    let res: Record<string, any>[] = [];
    if (executeEvent && formatter && formatter.trim()) {
      res = (await executeEvent(formatter, { data: list })) || [];
    } else {
      res = list;
    }
    dbSourceListByFormatter.value[code] = res;
  };
  const getDbSourceListByFormatter = computed(() => {
    const res = dbSourceListByFormatter.value;
    return res;
  });

  const loadDbSource = async (
    code: string,
    keyValue: string,
    values: string,
    params?: Record<string, any>,
  ) => {
    await dbSourceStore.load(code, keyValue, values, params);
  };
  const loadSetting = async (code: string, isCache: boolean = true) => {
    await dbSourceStore.loadSetting(code, isCache);
  };

  const clearDbSourceList = (code: string, params?: Record<string, any>) => {
    dbSourceStore.clear(code, params);
  };

  const getDbSourceOne = computed(() => {
    return dbSourceStore.oneDic;
  });
  const getSetting = computed(() => {
    return dbSourceStore.settingDic;
  });

  const getDbSourceOptions = (
    list: Record<string, any>,
    valueKey: string,
    labelKey: string,
    keyword?: string,
    idKey?: string,
    pidKey?: string,
  ) => {
    list = list || [];
    if (keyword) {
      list = list.filter((item) => item[labelKey].indexOf(keyword) !== -1);
    }
    return toTree(list, idKey || valueKey, pidKey || valueKey, valueKey, labelKey);
  };

  const getList = async (code: string, params?: Record<string, any>, sidx?: string) => {
    return await api.getDataList(code, params, sidx);
  };
  const getPages = async (code: string, pagination: any) => {
    return await api.getDataPage(code, pagination);
  };

  const getColOptions = (dataCode: string) => {
    if (!dataCode) return [];
    dbSourceStore.loadDbCol(dataCode);
    const res = dbSourceStore.colDic[dataCode] || [];
    return res.map((t) => ({ value: t, label: t }));
  };

  const appList = ref<any>(null);
  const appTree = computed(() => {
    const list = appList.value || [];
    const map = {};
    const res: any = [];
    const dataItemList = getDataItem.value['function'];
    (dataItemList || []).forEach((item) => {
      const point = {
        label: item.f_ItemName,
        value: item.f_ItemValue,
        disabled: true,
        children: [],
      };
      map[item.f_ItemValue] = point.children;
      res.push(point);
    });
    list.forEach((item) => {
      if (item.f_IsSystem != 3 && item.f_IsSystem != 4) {
        item.label = item.f_Name;
        item.value = item.f_Id;
        if (!map[item.f_Type]) {
          const point = {
            label: item.f_Type,
            value: item.f_Type,
            children: [],
          };
          map[item.f_Type] = point.children;
          res.push(point);
        }
        map[item.f_Type].push(item);
      }
    });
    return res;
  });
  const loadAppList = async () => {
    await loadDataItemList('function', false);
    const list = (await apiModule.getList()) || [];
    appList.value = list.filter((t) => t.f_EnabledMark == 1) || [];
  };
  let isFirstLoad = true;
  const getAppTreeOptions = () => {
    if (isFirstLoad) {
      loadAppList();
    }
    isFirstLoad = false;
    return appTree.value || [];
  };

  const loadDbSourceAll = async (isCache: boolean = true) => {
    await dbSourceStore.loadAll(isCache);
  };
  const getDbSourceAll = computed(() => {
    return dbSourceStore.list;
  });

  return {
    getDbSourceList,
    getDbSourceOne,
    loadDbSourceList,
    loadDbSource,
    clearDbSourceList,
    getDbSourceOptions,

    loadDbSourceAll,
    getDbSourceAll,

    loadDbSourceListByFormatter,
    getDbSourceListByFormatter,

    loadSetting,
    getSetting,

    getColOptions,

    // 无缓存
    getList,
    getPages,

    // 移动端功能树
    loadAppList,
    getAppTreeOptions,
  };
}
