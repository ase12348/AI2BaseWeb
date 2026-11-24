import { defineStore } from 'pinia';
import { store } from '/@/core/store';

import { useCURD } from '/@/core/utils/http/axios';

export interface moduleEntity {
  f_ModuleId: string;
  f_ParentId: string; //父级主键
  f_EnCode: string; //编码
  f_FullName: string; //名称
  f_Icon: string; //图标
  f_UrlAddress: string; //地址
  f_Target: string; //导航目标
  f_IsMenu?: number; //是否显示菜单 1 是 0 不是
  f_SortCode: number; //排序码
  f_DeleteMark: number; //删除标记
  f_EnabledMark: number; //有效标志
  f_Description: string; //备注
  f_CreateDate: string; //创建日期
  f_CreateUserId: string; //创建用户主键

  f_CreateUserName: string; //创建用户
  f_ModifyDate: string; //修改日期
  f_ModifyUserId: string; //修改用户主键
  f_ModifyUserName: string; //修改用户
  oldUrlAddress: string; //原先地址
  f_TerminalType?: number; //终端类型 0电脑端 1移动端
  f_Scheme?: string; //移动端功能方案（按钮/列表字段/表单字段 JSON）
  f_AppCode?: string; //应用编码
}

const urlPrefix = `system/module`;
const curd = useCURD<moduleEntity>(urlPrefix);
export const api = {
  ...curd,
};

interface TypeState {
  list: moduleEntity[];
  group: Record<string, moduleEntity[]>;
  dic: Record<string, moduleEntity>;
  dicByCode: Record<string, moduleEntity>;
}

export const useModuleStore = defineStore('system-module', {
  state: (): TypeState => ({
    list: [],
    group: {},
    dic: {},
    dicByCode: {},
  }),
  getters: {},
  actions: {
    /** 默认只加载电脑端菜单，移动端菜单由菜单管理页按需单独获取 */
    async loadList(terminalType = 0) {
      const list = (await api.getList({ terminalType })) || [];
      const modulesGroup: Record<string, moduleEntity[]> = {};
      const modulesDic: Record<string, moduleEntity> = {};
      const modulesDicByCode: Record<string, moduleEntity> = {};

      list.forEach((item) => {
        item.oldUrlAddress = item.f_UrlAddress;
        item.f_UrlAddress = item.f_UrlAddress?.toLowerCase();
        modulesGroup[item.f_ParentId] = modulesGroup[item.f_ParentId] || [];
        modulesGroup[item.f_ParentId].push(item);
        modulesDic[item.f_ModuleId] = item;
        modulesDicByCode[item.f_EnCode] = item;
      });

      this.list = list;
      this.group = modulesGroup;
      this.dic = modulesDic;
      this.dicByCode = modulesDicByCode;
    },
  },
});

// Need to be used outside the setup
export function useModuleStoreWithOut() {
  return useModuleStore(store);
}
