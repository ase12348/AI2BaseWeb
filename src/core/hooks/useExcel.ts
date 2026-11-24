import { useGlobSetting } from '/@/core/hooks/setting';
import { defHttp } from '/@/core/utils/http/axios';
import { ensureValidAccessToken } from '/@/core/utils/http/tokenRefresh';
import { useMessage } from '@/core/hooks/useMessage';
import { useUrl } from '@/core/hooks/useUrl';

import { api as exportApi } from '@/core/modules/excel/api/export';

import { t } from '@/core/locales/setupI18n';

const importApi = {
  /**
   * @description: upload
   */
  upload: (templateId: string, data: any) => {
    return defHttp.post({ url: `excel/import/${templateId}`, data }, { errorMessageMode: 'none' });
  },
  uploadData: (data: any) => {
    return defHttp.post(
      { url: `excel/import/scheme/upload/data`, data },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * @description: upload
   */
  uploadByConfig: (data: any) => {
    return defHttp.post({ url: `excel/import/scheme/upload`, data }, { errorMessageMode: 'none' });
  },
  downScheme: (data: any) => {
    return defHttp.post({ url: `excel/import/scheme/down`, data }, { errorMessageMode: 'none' });
  },
};

const webCofing = useGlobSetting();

const { error, success, warning } = useMessage();
const { getReq } = useUrl();

export function useExcel() {
  const excelExport = async (param: Record<string, any>) => {
    // 处理url连接
    if (param.dataUrl) {
      const req = getReq(param.dataUrl);
      if (!req) {
        warning(`${t('请先查询数据')},${t('再导出')}！`);
        return;
      }

      let url = req.url;

      if (req.params) {
        url = `${url}?`;
        let isFirst = true;
        for (const key in req.params) {
          let item = req.params[key];

          if (key == 'rows' && param.isPage) {
            item = 100000;
          }
          if (key == 'page' && param.isPage) {
            item = 1;
          }
          if (item !== undefined) {
            if (isFirst) {
              url += `${key}=${item}`;
              isFirst = false;
            } else {
              url += `&${key}=${item}`;
            }
          }
        }
      }

      if (req.data) {
        param.isPost = true;
        if (param.isPage) {
          if (req.data.paginationInputDto) {
            req.data.paginationInputDto.page = 1;
            req.data.paginationInputDto.rows = 100000;
          } else {
            req.data.page = 1;
            req.data.rows = 100000;
          }
        }

        param.reqData = JSON.stringify(req.data);
      }
      param.dataUrl = `${webCofing.apiUrl}/${encodeURI(url)}`;
      param.dataList = [];
    }

    // console.log(param);
    const id = await exportApi.down(param);
    if (id) {
      // 下载链接把 token 拼在 URL 上，不走拦截器，先确保未过期
      const token = await ensureValidAccessToken();
      const downUrl = `${webCofing.apiUrl}/excel/export/file/${param.fileName}/${id}?token=${token}`;
      success('导出成功');
      window.open(downUrl);
      return true;
    } else {
      error(`${t('导出失败')}!`);
      return false;
    }
  };
  const excelImportDownTemplate = async (code: string) => {
    const token = await ensureValidAccessToken();
    const downUrl = `${webCofing.apiUrl}/excel/import/scheme/${code}?token=${token}`;
    window.open(downUrl);
  };

  const excelImportDownTemplateByConfig = async (config: Record<string, any>) => {
    const downConfig = {
      name: config.title,
      list: config.columns.map((item: any) => ({
        f_ColName: item.label,
        f_Name: item.prop,
        f_CsType: item.csType,
        f_OnlyOne: item.moreConfig.onlyOne,
        f_RelationType: item.moreConfig.relationType,
        f_DataItemCode: item.moreConfig.dataItemCode,
        f_DSourceId: item.moreConfig.dSourceId,
        f_DSourceExcelId: item.moreConfig.dSourceExcelId,
        f_DSourceDBId: item.moreConfig.dSourceDBId,
        f_ValueType: item.moreConfig.value,
        f_EnCode: item.moreConfig.enCode,
      })),
    };

    // console.log(param);
    const id = await importApi.downScheme(downConfig);
    if (id) {
      const token = await ensureValidAccessToken();
      const downUrl = `${webCofing.apiUrl}/excel/export/file/${config.title}/${id}?token=${token}`;
      success('导出成功');
      window.open(downUrl);
      return true;
    } else {
      error(`${t('导出失败')}!`);
      return false;
    }
  };

  const excelImportUpload = async (code: string, data: Record<string, any>) => {
    return importApi.upload(code, data);
  };

  const excelImportUploadData = async (data: Record<string, any>) => {
    return importApi.uploadData(data);
  };

  const excelImportUploadByConfig = async (
    config: Record<string, any>,
    data: Record<string, any>,
  ) => {
    console.log(config, data);

    const uploadConfig = {
      name: config.title,
      fileId: data.fileId,
      fileName: data.fileName,
      chunks: data.chunks,
      entity: { f_DbTable: config.dbTable, f_DbId: config.dbCode, f_ErrorType: config.errorType },
      list: config.columns.map((item: any) => ({
        f_ColName: item.label,
        f_Name: item.prop,
        f_CsType: item.csType,
        f_OnlyOne: item.moreConfig.onlyOne,
        f_RelationType: item.moreConfig.relationType,
        f_DataItemCode: item.moreConfig.dataItemCode,
        f_DSourceId: item.moreConfig.dSourceId,
        f_DSourceExcelId: item.moreConfig.dSourceExcelId,
        f_DSourceDBId: item.moreConfig.dSourceDBId,
        f_ValueType: item.moreConfig.value,
        f_EnCode: item.moreConfig.enCode,
      })),
    };

    return importApi.uploadByConfig(uploadConfig);

    /*const uploadConfig = {
      ...config,
      data,
    };
    */
  };

  return {
    excelExport,
    excelImportDownTemplate,
    excelImportDownTemplateByConfig,
    excelImportUpload,

    excelImportUploadByConfig,
    excelImportUploadData,
  };
}
