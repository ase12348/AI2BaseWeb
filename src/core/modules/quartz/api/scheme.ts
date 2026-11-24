import { defHttp, useCURD } from '/@/core/utils/http/axios';
import module from '../module';

export interface quartzSchemeEntity {
  f_Id: string;
  f_RunId: string;
  f_Name: string;
  f_IsActive: number;
  f_BeginTime: string;
  f_EndType: number;
  f_EndTime: string;
  f_Description: string;
  f_Scheme: string;
  f_TenantId: string;
  f_CreateUserName: string; //创建人
  f_CreateDate: string; //创建时间
  f_ModifyDate: string; //修改时间
  f_ModifyUserName: string; //修改人
  f_RunActive: string; //运行状态
  f_DetectionTime: string; // 检测时间
}

const urlPrefix = `${module.code}/scheme`;
const curd = useCURD<quartzSchemeEntity>(urlPrefix);

export const api = {
  ...curd,
  /**
   * @description: pauseJob
   */
  pauseJob: (id: string) => {
    return defHttp.post({ url: `${urlPrefix}/job/pause/${id}` }, { errorMessageMode: 'none' });
  },
  /**
   * @description: resumeJob
   */
  resumeJob: (id: string) => {
    return defHttp.post({ url: `${urlPrefix}/job/resume/${id}` }, { errorMessageMode: 'none' });
  },
};
