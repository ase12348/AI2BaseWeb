import { useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface coderuleRoleEntity {
  f_RuleId: string;
  f_EnCode: string; //编码
  f_FullName: string; //名称
  f_CurrentNumber: string; //当前流水号
  f_DeleteMark: number; //删除标志
  f_EnabledMark: number; //有效标志
  f_Description: string; //描述
  f_CreateUserName: string; //创建人
  f_CreateDate: string; //创建时间
  f_ModifyDate: string; //修改时间
  f_ModifyUserName: string; //修改人
  f_ModifyUserId: string; //修改人Id
  f_RuleFormatJson: string; //标签
}

const urlPrefix = `${module.code}/coderule`;
const crud = useCURD<coderuleRoleEntity>(urlPrefix);

export const api = {
  ...crud,
};
