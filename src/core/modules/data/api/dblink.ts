import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface dblinkEntity {
  f_Id: string;
  f_DBAlias: string; //名称
  f_DBName: string; //编码
  f_DbType: string; //类型
  f_ServerAddress: string; //数据库地址
  f_Description: string; //描述
}

const urlPrefix = `${module.code}/dblink`;
const crud = useCURD<dblinkEntity>(urlPrefix);

export const api = {
  /**
   * @description: 获取配置记录
   */
  ...crud,
  test: (data: dblinkEntity) => {
    return defHttp.post(
      {
        url: `${urlPrefix}/test`,
        data,
      },
      { isTransformResponse: false },
    );
  },
};
