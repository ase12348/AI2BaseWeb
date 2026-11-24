import { defHttp, useCURD } from '/@/core/utils/http/axios';

import module from '../module';

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

const urlPrefix = `${module.code}/module`;
const curd = useCURD<moduleEntity>(urlPrefix);
export const api = {
  ...curd,

  get: (id) => {
    return defHttp.get<moduleEntity>({
      url: `${urlPrefix}3/${id}`,
    });
  },
  add: (data) => {
    return defHttp.post({
      url: `${urlPrefix}3`,
      method: 'post',
      data,
    });
  },
  update: (id, data) => {
    return defHttp.put({
      url: `${urlPrefix}3/${id}`,
      data,
    });
  },
  updateState: (id, state) => {
    return defHttp.put({
      url: `${urlPrefix}/state/${id}/${state}`,
    });
  },
};
