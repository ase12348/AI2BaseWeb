import { defineStore } from 'pinia';
import { Locale } from 'ant-design-vue/es/locale';
import { store } from '/@/core/store';
import { isString } from '/@/core/utils/is';
import antdLocale from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { defHttp } from '/@/core/utils/http/axios';

dayjs.locale('zh-cn');

export interface mappingEntity {
  f_code: string;
  chinese: string; //中文
  traditionalchinese: string; //简体中文
  english: string; //英文
  japanese: string; //日
}

export interface dataitemEntity {
  f_Id: string;
  f_ItemId: string;
  f_ItemCode: string;
  f_ParentId: string;
  f_OperateTime: string;
  f_OperateAccount: string;
  f_OperateUserId: string;
  f_IPAddress: string;
  f_Module: string;
  f_ExecuteResult: string;
  f_ExecuteResultJson: string;
}

const urlPrefix = `language/mapping`;
const getList = (mainCode, code) => {
  return defHttp.get(
    {
      url: `${urlPrefix}/${mainCode}/${code}`,
    },
    { withToken: false },
  );
};

export const api = {
  getList,
};

interface StateType {
  antdLocale?: Locale;
}

// 为了兼容之前vue2版本的数据
function getLocale(type) {
  const localeMap = {
    chinese: 'zh_CN',
    english: 'en_US',
    japanese: 'ja_JP',
    traditionalchinese: 'zh_TW',
  };
  return localeMap[type] || type;
}

function forAntdLocale(list: Record<string, any>, mapping: Record<string, string>, type: string) {
  Object.keys(list).forEach((key) => {
    const value = list[key];
    if (isString(value)) {
      if (key == 'locale') {
        list[key] = getLocale(type);
      } else {
        list[key] = mapping[value] || value.replace(/\$.[^\\$\\$]*\$/, '');
      }
    } else {
      forAntdLocale(value, mapping, type);
    }
  });
}

export const useLangMappingStore = defineStore('language-mapping', {
  state: (): StateType => ({
    antdLocale: undefined,
  }),
  actions: {
    async setAntdLocale(mainCode: string, code: string) {
      let langMap: any = {};
      // @ts-ignore
      antdLocale.DatePicker.lang.shortWeekDays = [
        '$shortWeekDay$日',
        '$shortWeekDay$一',
        '$shortWeekDay$二',
        '$shortWeekDay$三',
        '$shortWeekDay$四',
        '$shortWeekDay$五',
        '$shortWeekDay$六',
      ];
      // @ts-ignore
      antdLocale.DatePicker.lang.shortMonths = [
        '$shortMonth$1月',
        '$shortMonth$2月',
        '$shortMonth$3月',
        '$shortMonth$4月',
        '$shortMonth$5月',
        '$shortMonth$6月',
        '$shortMonth$7月',
        '$shortMonth$8月',
        '$shortMonth$9月',
        '$shortMonth$10月',
        '$shortMonth$11月',
        '$shortMonth$12月',
      ];
      if (mainCode != code) {
        langMap = await api.getList(mainCode, code);
        if (code !== 'english') {
          // @ts-ignore
          forAntdLocale(antdLocale, langMap, code);
        }
      } else {
        // @ts-ignore
        forAntdLocale(antdLocale.DatePicker.lang.shortWeekDays, {}, code);
        // @ts-ignore
        forAntdLocale(antdLocale.DatePicker.lang.shortMonths, {}, code);
      }

      if (code !== 'english') {
        this.antdLocale = antdLocale;
      } else {
        this.antdLocale = undefined;
      }
      return langMap;
    },
  },
});

// Need to be used outside the setup
export function useLangMappingStoreWithOut() {
  return useLangMappingStore(store);
}
