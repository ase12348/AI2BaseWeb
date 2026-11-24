/**
 * @description: 请求结果编码
 */
export enum ResultEnum {
  SUCCESS = 200,
  FAIL = 400,
  // 登录超时
  TIMEOUT = 401,
  // 访问令牌过期（凭刷新令牌换新令牌后重试，不直接退出登录）
  TOKEN_EXPIRED = 4011,
  EXCEPTION = 500,
}

/**
 * @description: request method
 */
export enum RequestEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * @description:  contentType
 */
export enum ContentTypeEnum {
  // json
  JSON = 'application/json;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data  upload
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
}
