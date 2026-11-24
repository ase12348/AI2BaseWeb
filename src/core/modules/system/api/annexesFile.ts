import { defHttp } from '/@/core/utils/http/axios';
import module from '../module';

const urlPrefix = `${module.code}/annexesFile`;

export const api = {
  /**
   * @description: merge
   */
  merge: (formData: any) => {
    return defHttp.post(
      { url: `${urlPrefix}/merge`, data: formData },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: merge
   */
  remove: (fileId: string) => {
    return defHttp.delete({ url: `${urlPrefix}/${fileId}` }, { errorMessageMode: 'none' });
  },
  /**
   * @description: removeDraft 丢弃附件夹下未保存的暂存附件
   */
  removeDraft: (folderId: string) => {
    return defHttp.delete({ url: `${urlPrefix}/draft/${folderId}` }, { errorMessageMode: 'none' });
  },
  /**
   * @description: removeChunks
   */
  removeChunks: (fileId: string, chunks) => {
    return defHttp.delete(
      { url: `${urlPrefix}/${fileId}/${chunks}` },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: getList
   */
  getList: (folderId: string) => {
    return defHttp.get({ url: `${urlPrefix}/${folderId}/list` }, { errorMessageMode: 'none' });
  },
  /**
   * @description: uploadTemp
   */
  uploadTemp: (ioc, data) => {
    return defHttp.post(
      { url: `${urlPrefix}/import/temp/${ioc}`, data },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: getHtml
   */
  getHtml: (fileId) => {
    return defHttp.get({ url: `${urlPrefix}/html/${fileId}` }, { errorMessageMode: 'none' });
  },
};
