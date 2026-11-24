// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import type { AxiosInstance, AxiosResponse } from 'axios';

import type { RequestOptions, Result, Pagination, PageResult } from '/#/axios';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';

import { ResultEnum, ContentTypeEnum } from '/@/core/enums/httpEnum';
import { isString, isUndefined, isNull, isEmpty } from '/@/core/utils/is';

import { clone } from 'lodash-es';
import axios from 'axios';
import { deepMerge } from '/@/core/utils';
import { useUrl } from '@/core/hooks/useUrl';

import { useGlobSetting } from '/@/core/hooks/setting';
import { useMessage } from '/@/core/hooks/useMessage';
import { useUserStoreWithOut } from '/@/core/store/organization/user';

import { VAxios } from './Axios';
import { checkStatus } from './checkStatus';
import { EncryptionFactory } from '@/core/utils/jcode';
import { resolveApiUrl } from '/@/core/app-api-url';
import { refreshAccessToken } from '../tokenRefresh';

import { t } from '@/core/locales/setupI18n';

const webCofing = useGlobSetting();
const { success, createSuccessModal } = useMessage();
const { addReq } = useUrl();

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理响应数据。如果数据不是预期格式，可直接抛出错误
   */
  transformResponseHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { isTransformResponse, isReturnNativeResponse, errorMessageMode } = options;
    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res;
    }

    // 错误的时候返回

    const { data, status } = res;
    // 这里 code，result，message为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    // 此处对返回的数据做赋值，.net 和 java 平台可以各自做对应的调整
    const { code, data: result, info: message, s } = data;

    // 这里逻辑可以根据项目进行修改
    if (code === ResultEnum.SUCCESS) {
      let successMsg = message;

      if (isNull(successMsg) || isUndefined(successMsg) || isEmpty(successMsg)) {
        successMsg = t('请求成功');
      }

      if (options.successMessageMode === 'modal') {
        createSuccessModal({ title: t('成功'), content: successMsg });
      } else if (options.successMessageMode === 'message') {
        success(successMsg);
      }

      let _result = result;

      if (s === 1) {
        _result = JSON.parse(
          EncryptionFactory.createAesEncryption({ key: 'jcodeapi' }).decrypt(_result),
        );
        // console.info(res.request.responseURL, _result, '解密');
      }
      if (!isTransformResponse) {
        // 用于页面代码可能需要直接获取code，data，message这些信息时开启
        return { data: _result, info: message };
      }

      return _result;
    } else {
      if (status == 200) {
        // console.log(code, '测试登录过期');
        checkStatus(code, message, errorMessageMode);
      }

      return false;
    }
  },

  /**
   * @description: 访问令牌过期（业务码 4011）→ 用刷新令牌换新令牌，成功则由 VAxios 重试原请求
   */
  tokenExpiredHook: () => {
    return refreshAccessToken();
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    // 单次请求可用 options.apiUrl 显式覆盖；
    // 否则应用优先（独立应用注册时交接的地址），未设置时用宿主地址。
    // 必须每次请求时解析：远程应用是在宿主 axios 初始化之后才异步注册的，
    // 若在模块初始化时就把 apiUrl 写死，应用地址永远不生效。
    const apiUrl = options.apiUrl || resolveApiUrl(webCofing.apiUrl);

    addReq({
      url: config.url,
      params: config.params,
      data: config.data,
    });

    /*const userStore = useUserStoreWithOut();

    if (userStore.getLoginInfo.id) {
      //@ts-ignore
      config.u = EncryptionFactory.createAesEncryption({
        key: userStore.getLoginInfo.id,
      }).encrypt(config.url);
    }*/

    if (
      apiUrl &&
      isString(apiUrl) &&
      config.url?.indexOf('http://') == -1 &&
      config.url?.indexOf('https://') == -1
    ) {
      config.url = `${apiUrl}/${config.url}`;
    }

    return config;
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config) => {
    if ((config as Recordable)?.requestOptions?.withToken !== false) {
      const userStore = useUserStoreWithOut();
      const token = userStore.getToken;
      if (token) {
        config.headers.token = token;
        //@ts-ignore
        config.headers.u = config.u;
      } else {
        console.log('requestInterceptors');
        throw new Error(`#HTTP_ERROR#${t('没有登录信息')}`);
      }

      // 设置登录者岗位
      config.headers.jcodepostId = userStore.getLoginInfo.postId;

      /**/
    }

    config.headers.dc = 'pc';

    return config;
  },

  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res;
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (axiosInstance: AxiosInstance, error: any) => {
    if (error.message === '#HTTP_ERROR#没有登录信息') {
      return Promise.reject(error);
    }

    const { response, config } = error || { response: {} };
    const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none';
    const msg: string = response?.data?.error?.message ?? error.message;

    //console.log(response, 'response');

    if (axios.isCancel(error)) {
      response.data = { code: 499, msg: t('请求已取消') };
      return Promise.resolve(response);
    }

    checkStatus(response?.status, msg, errorMessageMode);

    // 后续测试拦截机制
    // response = response || {};
    console.log(error, response);

    if (response) {
      response.data = { status: response?.status, msg };
      return Promise.resolve(response);
    }

    return Promise.reject(error.message);
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    // 深度合并
    deepMerge(
      {
        timeout: 3000000000000,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform: clone(transform),
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 消息提示类型
          errorMessageMode: 'message',
          // 接口地址
          apiUrl: webCofing.apiUrl,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
        },
      },
      opt || {},
    ),
  );
}

export const defHttp = createAxios();

export const useCURD = function <T>(url: string) {
  return {
    getPage: (params: Pagination) => {
      return defHttp.get<PageResult<T[]>>({
        url: `${url}/page`,
        params,
      });
    },
    getList: (params?) => {
      return defHttp.get<T[]>({
        url: `${url}s`,
        params,
      });
    },
    get: (id) => {
      return defHttp.get<T>({
        url: `${url}/${id}`,
      });
    },
    add: (data) => {
      return defHttp.post({
        url: `${url}`,
        method: 'post',
        data,
      });
    },
    update: (id, data) => {
      return defHttp.put({
        url: `${url}/${id}`,
        data,
      });
    },
    remove: (id) => {
      return defHttp.delete({
        url: `${url}/${id}`,
      });
    },
    deletes: (ids) => {
      return defHttp.delete({
        url: `${url}/deletes/${ids}`,
      });
    },
  };
};

// other api url
// export const otherHttp = createAxios({
//   requestOptions: {
//     apiUrl: 'xxx',
//     urlPrefix: 'xxx',
//   },
// });
