import { isEmpty, isString, isNull, isUndefined } from 'lodash-es';

export {
  isEmpty,
  isNil,
  isNull,
  isString,
  isTypedArray,
  isUndefined,
  isNumber,
  some,
  assign,
  forEach,
} from 'lodash-es';

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`;
}

// TODO 此处 isObject 存在歧义
export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object');
}

// TODO 此处 isArray 存在歧义
export function isArray(val: any): val is Array<any> {
  return val && Array.isArray(val);
}

/**
 * 判断是否为空
 */
export function isNullOrEmpty(val: any) {
  if (isNull(val) || isUndefined(val) || (isString(val) && isEmpty(val))) {
    return true;
  }

  if (isArray(val) && val.length === 0) {
    return true;
  }

  if (isObject(val) && Object.keys(val).length === 0) {
    return true;
  }

  return false;
}

export function isAny(element: any, types: any) {
  return types.includes(element.type);
}
