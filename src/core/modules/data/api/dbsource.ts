import type { Pagination } from '/#/axios';
import { defHttp, useCURD } from '/@/core/utils/http/axios';

import module from '../module';

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

const urlPrefix = `${module.code}/dbsource`;
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
  /**
   * @description: 根据sql获取
   */
  getColNameListBySql: (data) => {
    return defHttp.post({ url: `${urlPrefix}/sql/colnames`, data }, { errorMessageMode: 'none' });
  },
  /**
   * @description: 获取DataListWithCols
   */
  getDataListWithCols: (code: string, ParamsJson) => {
    return defHttp.post(
      {
        url: `${urlPrefix}/${code}/listWithCols`,
        data: {
          ParamsJson: ParamsJson ? JSON.stringify(ParamsJson) : '',
        },
      },
      { errorMessageMode: 'none' },
    );
  },

  /**
   * @description: 获取getViewPageByEntity
   */
  getViewPageByEntity: (pagination: Pagination, data: any) => {
    return defHttp.post<Record<string, any>>(
      { url: `${urlPrefix}/view/page`, params: pagination, data },
      { errorMessageMode: 'message' },
    );
  },
  /**
   * 获取数据源分页数据
   * @param code
   * @param pagination
   * @returns
   */
  getDataPage: (code: string, pagination: Pagination) => {
    const data: Record<string, any> = {};
    data.paramsJson = pagination.param;
    data.ids = pagination.ids;
    delete pagination.param;
    delete pagination.ids;
    return defHttp.post({
      url: `${urlPrefix}/${code}/page`,
      params: pagination,
      data,
    });
  },
  getColumns: (code: string) =>
    defHttp.get({
      url: `${urlPrefix}/${code}/columns`,
      method: 'get',
    }),
};
