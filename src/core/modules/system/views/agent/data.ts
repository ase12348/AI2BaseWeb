// 智能体（Agent）实体与后端接口
// 说明：对接 system/agent 控制器，路由遵循框架 useCURD 约定；页面代码无需改动。

import { defHttp } from '/@/core/utils/http/axios';
import module from '../../module';

import { t } from '@/core/locales/setupI18n';

export interface agentEntity {
  f_Id: string;
  f_Name: string; //名称
  f_Icon: string; //图标
  f_Description: string; //描述
  f_IsBuiltIn: number; //是否内置 1/0
  f_Published: number; //是否已发布 1/0
  f_CreateUserName: string; //创建人姓名
  f_CreateUserId: string; //创建人账号
  f_CreateDate: string; //创建时间
  f_ModifyDate: string; //修改时间
}

const urlPrefix = `${module.code}/agent`;

export const api = {
  /** 获取列表（可按关键词过滤名称/描述） */
  getList: (params: { keyword?: string } = {}): Promise<agentEntity[]> => {
    return defHttp.get<agentEntity[]>({ url: `${urlPrefix}s`, params });
  },

  /** 获取表单数据 */
  getForm: (keyValue: string): Promise<agentEntity> => {
    return defHttp.get<agentEntity>({ url: `${urlPrefix}/${keyValue}` });
  },

  /** 新增 */
  add: (data: Partial<agentEntity>) => {
    return defHttp.post({ url: `${urlPrefix}`, method: 'post', data });
  },

  /** 修改 */
  update: (keyValue: string, data: Partial<agentEntity>) => {
    return defHttp.put({ url: `${urlPrefix}/${keyValue}`, data });
  },

  /** 删除 */
  remove: (keyValue: string) => {
    return defHttp.delete({ url: `${urlPrefix}/${keyValue}` });
  },

  /** 复制：生成一个非内置、未发布的副本 */
  copy: (keyValue: string) => {
    return defHttp.post({ url: `${urlPrefix}/copy/${keyValue}`, method: 'post' });
  },

  /** 获取智能体版本列表（按智能体主键） */
  getVersions: (keyValue: string): Promise<agentVersionEntity[]> => {
    // TODO: 接入后替换为：return defHttp.get<agentVersionEntity[]>({ url: `${urlPrefix}/${keyValue}/versions` });
    return Promise.resolve([
      { f_Id: `${keyValue}_v3`, f_Name: `${t('智能体版本')}V3`, f_Enabled: 0 },
      { f_Id: `${keyValue}_v2`, f_Name: `${t('智能体版本')}V2`, f_Enabled: 1 },
      { f_Id: `${keyValue}_v1`, f_Name: `${t('智能体版本')}V1`, f_Enabled: 2 },
    ]);
  },
};

export interface agentVersionEntity {
  f_Id: string;
  f_Name: string; //版本名称
  f_Enabled: number; //版本状态 0设计中 1启用中 2已归档
}

export interface promptEntity {
  f_Id: string;
  f_Name: string; //名称
  f_Description: string; //描述
  f_Content: string; //提示词内容
  f_Type: number; //分类 1个人/0系统
}

// 提示词（Prompt）后端接口
// 说明：后端接口先空着，暂以模块内内存数据占位，接入后替换为真实请求
const promptStore: promptEntity[] = [];

export const promptApi = {
  /** 获取列表（个人分类） */
  getList: (): Promise<promptEntity[]> => {
    // TODO: 接入后替换为：return defHttp.get<promptEntity[]>({ url: `${urlPrefix}/prompts` });
    return Promise.resolve([...promptStore]);
  },

  /** 新增提示词（默认个人分类） */
  add: (data: Partial<promptEntity>): Promise<boolean> => {
    // TODO: 接入后替换为：return defHttp.post({ url: `${urlPrefix}/prompt`, method: 'post', data });
    promptStore.push({
      f_Id: `personal_${Date.now()}`,
      f_Name: data.f_Name || '',
      f_Description: data.f_Description || '',
      f_Content: data.f_Content || '',
      f_Type: data.f_Type ?? 1,
    });
    return Promise.resolve(true);
  },
};
