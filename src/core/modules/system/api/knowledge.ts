import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface knowledgeEntity {
  f_Id: string;
  f_Name: string; //名称
  f_Icon: string; //图标
  f_Description: string; //描述
  f_EmbedModel: string; //嵌入模型
  f_IsBuiltIn: number; //是否内置 1/0
  f_Published: number; //是否已发布 1/0
  f_CreateUserName: string; //创建人姓名
  f_CreateUserId: string; //创建人账号
  f_CreateDate: string; //创建时间
  f_ModifyDate: string; //修改时间
}

const urlPrefix = `${module.code}/knowledge`;
const crud = useCURD<knowledgeEntity>(urlPrefix);

export const api = {
  ...crud,

  /** 复制：生成一个非内置、未发布的副本 */
  copy: (keyValue: string) => {
    return defHttp.post({ url: `${urlPrefix}/copy/${keyValue}`, method: 'post' });
  },

  /** 获取文档学习页配置（文档解析策略/分段策略/分段设置），作为学习页默认值 */
  getLearnConfig: (docId: string) => {
    return defHttp.get(
      { url: `${urlPrefix}/doc/learnConfig/${docId}` },
      { errorMessageMode: 'none' },
    );
  },
};
