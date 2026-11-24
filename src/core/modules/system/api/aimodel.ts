import { useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface aiModelEntity {
  f_Id: string;
  f_Provider: string; //提供商
  f_Model: string; //模型
  f_ApiKey: string; //API密钥
  f_Url: string; //接口地址（自定义时使用）
  f_CreateUserName: string; //创建人
  f_CreateDate: string; //创建时间
  f_ModifyDate: string; //修改时间
  f_ModifyUserName: string; //修改人
  f_ModifyUserId: string; //修改人Id
}

const urlPrefix = `${module.code}/aimodel`;
const crud = useCURD<aiModelEntity>(urlPrefix);

export const api = {
  ...crud,
};
