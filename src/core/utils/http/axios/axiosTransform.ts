/**
 * Data processing class, can be configured according to the project
 */
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import type { RequestOptions, Result } from '/#/axios';

export interface CreateAxiosOptions extends AxiosRequestConfig {
  transform?: AxiosTransform;
  requestOptions?: RequestOptions;
}

export abstract class AxiosTransform {
  /**
   * A function that is called before a request is sent. It can modify the request configuration as needed.
   * 在发送请求之前调用的函数。它可以根据需要修改请求配置。
   */
  beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;

  /**
   * @description: 处理响应数据
   */
  transformResponseHook?: (res: AxiosResponse<Result>, options: RequestOptions) => any;

  /**
   * @description: 访问令牌过期（业务码 4011）时换取新令牌
   * @returns true 表示已换到新令牌，当前请求可以重试
   */
  tokenExpiredHook?: (res: AxiosResponse<Result>, options: RequestOptions) => Promise<boolean>;

  /**
   * @description: 请求失败处理
   */
  requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>;

  /**
   * @description: 请求之前的拦截器
   */
  requestInterceptors?: (
    config: InternalAxiosRequestConfig,
    options: CreateAxiosOptions,
  ) => InternalAxiosRequestConfig;

  /**
   * @description: 请求之后的拦截器
   */
  responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>;

  /**
   * @description: 请求之前的拦截器错误处理
   */
  requestInterceptorsCatch?: (error: Error) => void;

  /**
   * @description: 请求之后的拦截器错误处理
   */
  responseInterceptorsCatch?: (axiosInstance: AxiosInstance, error: Error) => void;
}
