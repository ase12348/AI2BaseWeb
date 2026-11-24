import type {
  AxiosRequestConfig,
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import type { RequestOptions, Result, UploadFileParams } from '/#/axios';
import type { CreateAxiosOptions, AxiosTransform } from './axiosTransform';
import axios from 'axios';
import qs from 'qs';
// import { AxiosCanceler } from './axiosCancel';
import { isFunction } from '/@/core/utils/is';
import { cloneDeep } from 'lodash-es';
import { ContentTypeEnum, RequestEnum, ResultEnum } from '/@/core/enums/httpEnum';

export * from './axiosTransform';

/**
 * @description:  axios module
 */
export class VAxios {
  private axiosInstance: AxiosInstance;
  private readonly options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    this.setupInterceptors();
  }

  /**
   * @description:  Create axios instance
   */
  private createAxios(config: CreateAxiosOptions): void {
    this.axiosInstance = axios.create(config);
  }

  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * @description: Reconfigure axios
   */
  configAxios(config: CreateAxiosOptions) {
    if (!this.axiosInstance) {
      return;
    }
    this.createAxios(config);
  }

  /**
   * @description: Set general header
   */
  setHeader(headers: any): void {
    if (!this.axiosInstance) {
      return;
    }
    Object.assign(this.axiosInstance.defaults.headers, headers);
  }

  /**
   * @description: Interceptor configuration 拦截器配置
   */
  private setupInterceptors() {
    // const transform = this.getTransform();
    const {
      axiosInstance,
      options: { transform },
    } = this;
    if (!transform) {
      return;
    }
    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform;

    // const axiosCanceler = new AxiosCanceler();

    // Request interceptor configuration processing
    this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // If cancel repeat request is turned on, then cancel repeat request is prohibited
      /*const requestOptions =
        (config as unknown as any).requestOptions ?? this.options.requestOptions;
      const ignoreCancelToken = requestOptions?.ignoreCancelToken ?? true;

      !ignoreCancelToken && axiosCanceler.addPending(config);*/

      if (requestInterceptors && isFunction(requestInterceptors)) {
        config = requestInterceptors(config, this.options);
      }
      return config;
    }, undefined);

    // Request interceptor error capture
    requestInterceptorsCatch &&
      isFunction(requestInterceptorsCatch) &&
      this.axiosInstance.interceptors.request.use(undefined, requestInterceptorsCatch);

    // Response result interceptor processing
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      // res && axiosCanceler.removePending(res.config);
      if (responseInterceptors && isFunction(responseInterceptors)) {
        res = responseInterceptors(res);
      }
      return res;
    }, undefined);

    // Response result interceptor error capture
    responseInterceptorsCatch &&
      isFunction(responseInterceptorsCatch) &&
      this.axiosInstance.interceptors.response.use(undefined, (error) => {
        return responseInterceptorsCatch(axiosInstance, error);
      });
  }

  /**
   * @description:  File Upload
   */
  uploadFile<T = any>(config: AxiosRequestConfig, params: UploadFileParams) {
    const formData = new window.FormData();
    const customFilename = params.name || 'file';

    if (params.filename) {
      formData.append(customFilename, params.file, params.filename);
    } else {
      formData.append(customFilename, params.file);
    }

    if (params.data) {
      Object.keys(params.data).forEach((key) => {
        const value = params.data![key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
          return;
        }

        formData.append(key, params.data![key]);
      });
    }

    return this.axiosInstance.request<T>({
      ...config,
      method: 'POST',
      data: formData,
      headers: {
        'Content-type': ContentTypeEnum.FORM_DATA,
        // @ts-ignore
        ignoreCancelToken: true,
      },
    });
  }

  /**
   * @description:  File Upload
   */
  postFormData<T = any>(config: AxiosRequestConfig, params: Recordable) {
    const formData = new window.FormData();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params![key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
          return;
        }

        formData.append(key, params![key]);
      });
    }

    const { requestOptions } = this.options;

    const opt: RequestOptions = Object.assign({}, requestOptions, {});
    const transform = this.getTransform();

    const { beforeRequestHook } = transform || {};
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      config = beforeRequestHook(config, opt);
    }

    return this.axiosInstance.request<T>({
      ...config,
      method: 'POST',
      data: formData,
      headers: {
        'Content-type': ContentTypeEnum.FORM_DATA,
        // @ts-ignore
        ignoreCancelToken: true,
      },
    });
  }

  // support form-data
  supportFormData(config: AxiosRequestConfig) {
    const headers = config.headers || this.options.headers;
    const contentType = headers?.['Content-Type'] || headers?.['content-type'];

    if (
      contentType !== ContentTypeEnum.FORM_URLENCODED ||
      !Reflect.has(config, 'data') ||
      config.method?.toUpperCase() === RequestEnum.GET
    ) {
      return config;
    }

    return {
      ...config,
      data: qs.stringify(config.data, { arrayFormat: 'brackets' }),
    };
  }

  get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options);
  }

  request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    let conf: CreateAxiosOptions = cloneDeep(config);
    // cancelToken 如果被深拷贝，会导致最外层无法使用cancel方法来取消请求
    if (config.cancelToken) {
      conf.cancelToken = config.cancelToken;
    }

    if (config.signal) {
      conf.signal = config.signal;
    }

    const transform = this.getTransform();

    const { requestOptions } = this.options;

    const opt: RequestOptions = Object.assign({}, requestOptions, options);

    const { beforeRequestHook, requestCatchHook, transformResponseHook, tokenExpiredHook } =
      transform || {};
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt);
    }
    conf.requestOptions = opt;

    conf = this.supportFormData(conf);

    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<Result>>(conf)
        .then(async (res: AxiosResponse<Result>) => {
          try {
            // 访问令牌过期：用刷新令牌换新令牌后把当前请求重试一次（每个请求只重试一次）
            const retriedRes = await this.retryOnTokenExpired(res, conf, opt, tokenExpiredHook);
            if (retriedRes) {
              res = retriedRes;
            }

            if (transformResponseHook && isFunction(transformResponseHook)) {
              const ret = transformResponseHook(res, opt);
              resolve(ret);
            } else {
              resolve(res as unknown as Promise<T>);
            }
          } catch (err) {
            reject(err || new Error('request error!'));
          }
        })
        .catch((e: Error | AxiosError) => {
          if (requestCatchHook && isFunction(requestCatchHook)) {
            reject(requestCatchHook(e, opt));
            return;
          }
          if (axios.isAxiosError(e)) {
            // rewrite error message from axios in here
          }
          reject(e);
        });
    });
  }

  /**
   * 响应体业务码为 4011（访问令牌过期）时触发续期，成功后重发原请求。
   * @returns 重试后的响应；不需要/未成功续期时返回 null
   */
  private async retryOnTokenExpired(
    res: AxiosResponse<Result>,
    conf: CreateAxiosOptions,
    opt: RequestOptions,
    tokenExpiredHook?: AxiosTransform['tokenExpiredHook'],
  ): Promise<AxiosResponse<Result> | null> {
    if (
      !tokenExpiredHook ||
      !isFunction(tokenExpiredHook) ||
      opt?.withToken === false ||
      (conf as Recordable).__tokenRetried
    ) {
      return null;
    }

    const body = (res as AxiosResponse<Result & { code?: number }>)?.data;
    if (!body || Number(body.code) !== ResultEnum.TOKEN_EXPIRED) {
      return null;
    }

    // 标记在 conf 上，重试后的响应再是 4011 也不会无限递归
    (conf as Recordable).__tokenRetried = true;
    const refreshed = await tokenExpiredHook(res, opt);
    if (!refreshed) {
      return null;
    }

    // 重发时会重新走请求拦截器，token 头取的是续期后的新令牌
    return this.axiosInstance.request<any, AxiosResponse<Result>>(conf);
  }
}
