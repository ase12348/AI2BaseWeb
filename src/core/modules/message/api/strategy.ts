import { useCURD } from '/@/core/utils/http/axios';

import module from '../module';

export interface strategyEntity {
  f_Id: string;
  f_StrategyName: string;
  f_StrategyCode: string;
  f_SendRole: string;
  f_MessageType: string;
  f_Description: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_TenantId: string;
}

const urlPrefix = `${module.code}/strategy`;
const crud = useCURD<strategyEntity>(urlPrefix);

export const api = {
  ...crud,
};
