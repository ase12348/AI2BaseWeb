import { defHttp } from '/@/core/utils/http/axios';

export interface moduleEntity {
  f_ModuleId: string;
  /**
   * 父级主键
   */
  f_ParentId: string;
  /**
   * 编码
   */
  f_EnCode: string;
  /**
   * 名称
   */
  f_FullName: string;
  /**
   * 图标
   */
  f_Icon: string;
  /**
   * 地址
   */
  f_UrlAddress: string;
  /**
   * 导航目标
   */
  f_Target: string;
  /**
   * 是否显示菜单 1 是 0 不是
   */
  f_IsMenu?: number;
  /**
   * 排序码
   */
  f_SortCode: number;
  /**
   * 删除标记
   */
  f_DeleteMark: number;
  /**
   * 有效标志
   */
  f_EnabledMark: number;
  /**
   * 备注
   */
  f_Description: string;
  /**
   * 创建日期
   */
  f_CreateDate: string;
  /**
   * 创建用户主键
   */
  f_CreateUserId: string;
  /**
   * 创建用户
   */
  f_CreateUserName: string;
  /**
   * 修改日期
   */
  f_ModifyDate: string;
  /**
   * 修改用户主键
   */
  f_ModifyUserId: string;
  /**
   * 修改用户
   */
  f_ModifyUserName: string;
  // 原先地址
  oldUrlAddress: string;
}

export interface mappingEntity {
  f_code: string;
  chinese: string; //中文
  traditionalchinese: string; //简体中文
  english: string; //英文
  japanese: string; //日
}

const urlPrefix = `system/module`;
export const api = {
  /**
   * @description: 菜单列表
   */
  getList: () => {
    return defHttp.get<moduleEntity[]>({ url: `${urlPrefix}s` }, { errorMessageMode: 'none' });
  },
  getMapping: (code) => {
    return defHttp.get<mappingEntity[]>(
      { url: `language/mapping/modules/${code}/1` },
      { errorMessageMode: 'none' },
    );
  },
};
