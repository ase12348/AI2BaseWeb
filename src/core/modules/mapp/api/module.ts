import { defHttp } from '/@/core/utils/http/axios';
import module from '../module';

export interface functionEntity {
  f_Id: string;
  f_Type: string;
  f_FormCode: string;
  f_FormVerison: string;
  f_Icon: string;
  f_Color: string;
  f_Name: string;
  f_SchemeId: string;
  f_EnabledMark: number;
  f_SortCode: number;
  f_IsSystem: number;
  f_Url: string;
  f_CreateDate: string;
  f_CreateUserId: string;
  f_CreateUserName: string;
  f_ModifyDate: string;
  f_ModifyUserId: string;
  f_ModifyUserName: string;
  f_TenantId: string;
  f_IsEdit: number;
  f_OldId: string;
  scheme: string;
}

const urlPrefix = `${module.code}/module`;
/**
 * 移动端功能（数据统一存放在菜单表 lr_base_module，F_Scheme 保存按钮/列表字段/表单字段）
 * 已取消 lr_app_function / lr_app_fnscheme / lr_app_moduleitem / lr_app_myfunction，
 * 因此不再提供新增、修改、删除、启停用的接口。
 */
export const api = {
  /**
   * @description: 获取数据
   */
  getList: () => {
    return defHttp.get<functionEntity[]>({ url: `${urlPrefix}s` }, { errorMessageMode: 'none' });
  },
  getChildren: (id: string, type: number) => {
    return defHttp.get({
      url: `${urlPrefix}/children/${type}/${id}`,
    });
  },
};
