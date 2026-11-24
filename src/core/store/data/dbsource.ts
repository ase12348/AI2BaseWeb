import { defineStore } from 'pinia';
import { store } from '/@/core/store';
import { isNullOrEmpty } from '@/core/utils/jcode';
import { defHttp, useCURD } from '/@/core/utils/http/axios';

export interface dbsourceEntity {
  f_Id: string;
  f_Code: string;
  f_Name: string;
  f_DbId: string;
  f_Sql: string;
  f_Type: number;
  f_Category: string;
  f_Description: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_CreateDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_ModifyDate: string;
  f_TenantId: string;
  f_IsEdit: number;
}

const urlPrefix = `data/dbsource`;
const crud = useCURD<dbsourceEntity>(urlPrefix);
export const api = {
  ...crud,
  /**
   * @description: 数据源数据
   */
  getDataList: (code, paramsJson, sidx) => {
    return defHttp.post<Record<string, any>[]>(
      {
        url: `${urlPrefix}/${code}/list`,
        data: { ParamsJson: paramsJson ? JSON.stringify(paramsJson) : '', sidx },
      },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: 获取数据
   */
  getDataListByValues: (code, filed, data) => {
    return defHttp.post(
      {
        url: `${urlPrefix}/${code}/${filed}/list`,
        data,
      },
      { errorMessageMode: 'none' },
    );
  },

  /**
   * @description: 获取ColNameList
   */
  getColNameList: (code: string) => {
    return defHttp.get({ url: `${urlPrefix}/${code}/colnames` }, { errorMessageMode: 'none' });
  },
};

interface StateType {
  dic: Record<string, Record<string, any>[]>;
  oneDic: Record<string, any>;
  loadState: Record<string, boolean>;

  colDic: Record<string, any>;
  colLoadState: Record<string, boolean>;

  settingLoadState: Record<string, boolean>;
  settingDic: Record<string, dbsourceEntity>;

  list: Record<string, any>[];
  isUpdate: boolean;
}

const getKey = (code: string, params?: Record<string, any>) => {
  let key = code;
  if (params) {
    key += `_${JSON.stringify(params)}`;
  }
  return key;
};

const DbsourceValues: Record<
  string,
  { params?: Record<string, any>; values: string[]; code: string; valueKey: string }
> = {};
let DataSourceLoadTimer; // 加载定时器

export const useDbSourceStore = defineStore('data-dbsource', {
  state: (): StateType => ({
    dic: {},
    oneDic: {},
    loadState: {},

    colLoadState: {},
    colDic: {},

    // 数据源配置加载
    settingLoadState: {},
    settingDic: {},

    list: [],
    isUpdate: false,
  }),
  getters: {},
  actions: {
    async loadAll(isCache: boolean = true) {
      if (!this.isUpdate || !isCache) {
        this.isUpdate = true;
        const res = await api.getList();
        this.list = Array.isArray(res) ? res : [];
      }
    },
    async loadList(code: string, params?: Record<string, any>, isCache: boolean = true) {
      if (isNullOrEmpty(code)) {
        return;
      }
      const key = getKey(code, params);
      if (!this.loadState[key] || !isCache) {
        this.loadState[key] = true;
        const list = (await api.getDataList(code, params, '')) || [];
        this.dic[key] = list;
      }
    },
    async load(code: string, valueKey: string, values: string, params?: Record<string, any>) {
      if (isNullOrEmpty(code)) {
        return;
      }
      const key = `${getKey(code, params)}_${valueKey}`;
      DbsourceValues[key] = DbsourceValues[key] || {
        code,
        params,
        valueKey,
        values: [],
      };
      values = (values || '') + '';
      const vList = values.split(',');
      vList.forEach((value) => {
        const vKey = `${code}_${valueKey}_${value}`;
        if (!this.loadState[vKey]) {
          this.loadState[vKey] = true;
          DbsourceValues[key].values.push(value);
        }
      });

      if (DbsourceValues[key].values.length > 0 && !DataSourceLoadTimer) {
        DataSourceLoadTimer = setTimeout(async () => {
          Object.keys(DbsourceValues).forEach(async (key) => {
            const { code, params, valueKey, values } = DbsourceValues[key];
            delete DbsourceValues[key];
            if (values.length > 0) {
              // 数据源不存在/查询异常时后端返回的是 {code,info} 而非数组，这里必须兜底，
              // 否则一个缺失的数据源会让整张表格的渲染直接抛错
              const list = (await api.getDataListByValues(code, valueKey, {
                ids: values.join(','),
                paramsJson: JSON.stringify(params),
              })) as Record<string, any>[];
              (Array.isArray(list) ? list : []).forEach((item) => {
                const vKey = `${code}_${valueKey}_${item[valueKey]}`;
                this.oneDic[vKey] = item;
              });
            }
          });
          DataSourceLoadTimer = null;

          // console.log(values, '数据源加载完成');
        }, 50);
      }
    },
    async loadSetting(code: string, isCache: boolean = true) {
      if (isNullOrEmpty(code)) {
        return;
      }
      if (!this.settingLoadState[code] || !isCache) {
        this.settingLoadState[code] = true;
        const entity = await api.get(code);
        this.settingDic[code] = entity;
      }
      return this.settingDic[code] || {};
    },
    async loadDbCol(code: string, isCache: boolean = true) {
      if (!this.colLoadState[code] || !isCache) {
        this.colLoadState[code] = true;
        const data = await api.getColNameList(code);
        this.colDic[code] = data;
      }
    },
    clear(code: string, params?: Record<string, any>) {
      const key = getKey(code, params);
      this.loadState[key] = false;
      delete this.dic[key];
      this.isUpdate = false;
    },
  },
});

// Need to be used outside the setup
export function useDbSourceStoreWithOut() {
  return useDbSourceStore(store);
}
