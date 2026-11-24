import { defHttp } from '/@/core/utils/http/axios';
import module from '../module';

export interface dataitemEntity {
  /**
   * 主键
   */
  f_ItemId: string;
  /**
   * 父级ID
   */
  f_ParentId: string;
  /**
   * 分类编码
   */
  f_ItemCode: string;
  /**
   * 分类名称
   */
  f_ItemName: string;
  /**
   * 树型结构
   */
  f_IsTree: string;
  /**
   * 排序码
   */
  f_SortCode: string;
  /**
   * 删除标记
   */
  f_DeleteMark: number;
  /**
   * 有效标记
   */
  f_EnabledMark: number;
  /**
   * 备注
   */
  f_Description: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
}
export interface dataItemDetailEntity {
  /**
   * 主键
   */
  f_Id: string;
  /**
   * 分类主键
   */
  f_ItemId: string;
  /**
   * 分类编码
   */
  f_ItemCode: string;
  /**
   * 父级ID
   */
  f_ParentId: string;
  /**
   * 名称
   */
  f_ItemName: string;
  /**
   * 值
   */
  f_ItemValue: string;
  /**
   * 排序码
   */
  f_SortCode: string;
  /**
   * 删除标记
   */
  f_DeleteMark: number;
  /**
   * 有效标记
   */
  f_EnabledMark: number;
  /**
   * 备注
   */
  f_Description: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
}

const urlPrefix = `${module.code}/dataitem`;
export const api = {
  /**
   * @description: 字典分类
   */
  getClassifys: () => {
    return defHttp.get<dataitemEntity[]>(
      { url: `${urlPrefix}/classifys` },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: 字典明细
   */
  getDetails: (code: string) => {
    return defHttp.get<dataItemDetailEntity[]>(
      { url: `${urlPrefix}/details/${code}` },
      { errorMessageMode: 'none' },
    );
  },
  getClassify: (id: string) => {
    return defHttp.get({
      url: `${urlPrefix}/classify/${id}`,
    });
  },
  addCategory: (data: dataitemEntity) => {
    return defHttp.post({
      url: `${urlPrefix}/classify`,
      data,
    });
  },
  updateCategory: (id: string, data: dataitemEntity) => {
    return defHttp.put({
      url: `${urlPrefix}/classify/${id}`,
      data,
    });
  },
  removeCategory: (id: string) => {
    return defHttp.delete({
      url: `${urlPrefix}/classify/${id}`,
    });
  },
  addDetail: (code: string, data: dataItemDetailEntity) => {
    return defHttp.post({
      url: `${urlPrefix}/detail/${code}`,
      data,
    });
  },
  addDetails: (code: string, data: any) => {
    return defHttp.post({
      url: `${urlPrefix}/details/${code}`,
      data,
    });
  },
  updateDetail: (id: string, data: dataItemDetailEntity) => {
    return defHttp.put({
      url: `${urlPrefix}/detail/${id}`,
      data,
    });
  },
  removeDetail: (id: string) => {
    return defHttp.delete({
      url: `${urlPrefix}/detail/${id}`,
    });
  },
};
