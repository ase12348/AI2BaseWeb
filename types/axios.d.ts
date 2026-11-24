export type ErrorMessageMode = 'none' | 'modal' | 'message' | undefined;
export type SuccessMessageMode = ErrorMessageMode;

/**
 * @description 返回结果
 */
export interface Result<T = any> {
  code: number;
  info: string;
  s?: int;
  data: T;
}

export interface Pagination {
  /**
   * 每页行数
   */
  rows: number;
  /**
   * 当前页
   */
  page: number;
  /**
   * 排序列
   */
  sidx: string;

  [propName: string]: any;
}

export interface PageResult<T = any> {
  /**
   * 当前页
   */
  page: number;
  /**
   * 记录数
   */
  records: number;
  /**
   * 总共页数
   */
  total: number;
  /**
   * 数据
   */
  rows: T;
}

export interface RequestOptions {
  // Splicing request parameters to url
  joinParamsToUrl?: boolean;
  // Whether to process the request result
  isTransformResponse?: boolean;
  // Whether to return native response headers
  // For example: use this attribute when you need to get the response headers
  isReturnNativeResponse?: boolean;
  // Interface address, use the default apiUrl if you leave it blank
  apiUrl?: string;
  // Error message prompt type
  errorMessageMode?: ErrorMessageMode;
  // Success message prompt type
  successMessageMode?: SuccessMessageMode;

  // ignoreCancelToken?: boolean;
  // Whether to send token in header
  withToken?: boolean;
}

// multipart/form-data: upload file
export interface UploadFileParams {
  // Other parameters
  data?: Recordable;
  // File parameter interface field name
  name?: string;
  // file name
  file: File | Blob;
  // file name
  filename?: string;
  [key: string]: any;
}
