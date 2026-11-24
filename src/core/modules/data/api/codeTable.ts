import { defHttp, useCURD } from '/@/core/utils/http/axios';
import type { Pagination, PageResult } from '/#/axios';
import module from '../module';

export interface codetableEntity {
  f_Id: string;
  f_DBAlias: string; //名称
  f_DBName: string; //编码
  f_DbType: string; //类型
  f_ServerAddress: string; //数据库地址
  f_Description: string; //备注
  f_ClassName: string;
}

const urlPrefix = `${module.code}/codeTable`;
const crud = useCURD<codetableEntity>(urlPrefix);

/**
 * 模型列与库里列的差异列
 * 后端属性名经 camelCase 序列化：Name -> name、IsProtected -> isProtected
 */
export interface CodeTableDiffColumnDto {
  /** 列名 */
  name: string;
  /** 列说明 */
  description?: string;
  /** 数据库类型 */
  dataType?: string;
  /** 是否主键 */
  isPrimaryKey?: boolean;
  /** 是否自增 */
  isIdentity?: boolean;
  /** 受保护：主键或自增列，后端会拒绝回收 */
  isProtected?: boolean;
}

/**
 * 数据表模型与物理表之间的列差异
 */
export interface CodeTableColumnDiffDto {
  tableName: string;
  /** 物理表当前是否存在 */
  tableExists: boolean;
  /** 是否宿主自有表：为真时不允许由模型改结构，也不允许回收列 */
  isFrameworkTable: boolean;
  /** 模型有、库里没有：本次会新建的列 */
  add: CodeTableDiffColumnDto[];
  /** 库里有、模型没有：可以被回收的列 */
  drop: CodeTableDiffColumnDto[];
}

/**
 * 数据表模型里已经不该存在的登记行
 */
export interface CodeTableInvalidDto {
  id: string;
  tableName: string;
  description?: string;
  /** missing=库里已经没有这张表，framework=宿主自有表不该进模型，unknown=库连接读不出来，需人工判断 */
  reason: 'missing' | 'framework' | 'unknown';
  /** 物理表是否还在：为真时清掉登记并不会删除表本身 */
  physicalExists: boolean;
}

export const api = {
  ...crud,
  getList: (dbcode: string, tableNames: string) =>
    defHttp.get({
      url: `${urlPrefix}s/${dbcode}`,
      method: 'get',
      params: { tableNames },
    }),

  /**
   * @description: 数据表模型
   */
  getTablePage: (params: Pagination) => {
    return defHttp.get<PageResult<codetableEntity[]>>({ url: `${urlPrefix}/page`, params });
  },
  importTable: (code: string, data: any) => {
    return defHttp.post({
      url: `${urlPrefix}/importTable/${code}`,
      data,
    });
  },
  /**
   * @description: 把数据表模型同步到库，dropFields 为已经过前端确认要回收的列（逗号分隔）
   */
  createOrUpdateTable: (tableid: string, dbcode: string, dbName: string, dropFields?: string) => {
    return defHttp.put({
      url: `${urlPrefix}/table/${tableid}/${dbcode}`,
      params: { dbName, dropFields },
    });
  },
  /**
   * @description: 更新前读取模型列与库里列的差异
   */
  getColumnDiff: (tableid: string, dbcode: string) => {
    return defHttp.get<CodeTableColumnDiffDto>({
      url: `${urlPrefix}/diff/${tableid}/${dbcode}`,
    });
  },
  /**
   * @description: 读取本库中已经不该存在的登记行
   */
  getInvalids: (dbcode: string) => {
    return defHttp.get<CodeTableInvalidDto[]>({
      url: `${urlPrefix}/invalids/${dbcode}`,
    });
  },
  updateTableData: (data) => {
    return defHttp.post({
      url: `${urlPrefix}/updateTableData`,
      data,
    });
  },
};
