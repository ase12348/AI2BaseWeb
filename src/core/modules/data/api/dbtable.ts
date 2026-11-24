import { defHttp } from '/@/core/utils/http/axios';
import module from '../module';

export interface dbtableEntity {
  dbObjectType: number; // 类型
  name: string; //名称
  description: string; //描述
}

const urlPrefix = `${module.code}/dbtable`;
export const api = {
  /**
   * @description: 数据表查看
   */
  getTables: (code) => {
    return defHttp.get<dbtableEntity[]>(
      { url: `${urlPrefix}s/${code}` },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: 可导入数据表模型的表（后端已剔除宿主自有表）
   */
  getImportableTables: (code) => {
    return defHttp.get<dbtableEntity[]>(
      { url: `${urlPrefix}s/importable/${code}` },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: 判断字段是否重复
   */
  existFiled: (params) => {
    return defHttp.get({
      url: `${urlPrefix}/exist/filed`,
      params: params,
    });
  },
  /**
   * @description: 获取数据
   */
  getDataList: (params) => {
    return defHttp.get({
      url: `${urlPrefix}/datas`,
      params: params,
    });
  },
  /**
   * @description: 获取数据分页
   */
  getDataPage: (params) => {
    return defHttp.get({
      url: `${urlPrefix}/data/page`,
      params: params,
    });
  },
  /**
   * @description: 获取列
   */
  getColumns: (code: string, table) => {
    return defHttp.get({
      url: `${urlPrefix}/columns/${code}/${table}`,
    });
  },

  /**
   * @description: 存储过程执行
   */
  executeProc: (code: string, data: Record<string, any>) => {
    return defHttp.post({
      url: `${urlPrefix}/proc/${code}`,
      data,
    });
  },
};
