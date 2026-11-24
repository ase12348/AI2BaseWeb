import { intersectionWith, isEqual, mergeWith, unionWith } from 'lodash-es';
import { isArray, isObject } from './is';

export const buildUUID = () => {
  const guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return guid;
};

/**
 * 生成一个uuid
 */
let unique = 0;
export function buildShortUUID(prefix = ''): string {
  const time = Date.now();
  const random = Math.floor(Math.random() * 1000000000);
  unique++;

  if (prefix) {
    return prefix + '_' + random + unique + String(time);
  }
  return random + unique + String(time);
}

/**
 * Recursively merge two objects.
 * 递归合并两个对象。
 *
 * @param source The source object to merge from. 要合并的源对象。
 * @param target The target object to merge into. 目标对象，合并后结果存放于此。
 * @param mergeArrays How to merge arrays. Default is "replace".
 *        如何合并数组。默认为replace。
 *        - "union": Union the arrays. 对数组执行并集操作。
 *        - "intersection": Intersect the arrays. 对数组执行交集操作。
 *        - "concat": Concatenate the arrays. 连接数组。
 *        - "replace": Replace the source array with the target array. 用目标数组替换源数组。
 * @returns The merged object. 合并后的对象。
 */
export function deepMerge<T extends object | null | undefined, U extends object | null | undefined>(
  source: T,
  target: U,
  mergeArrays: 'union' | 'intersection' | 'concat' | 'replace' = 'replace',
): T & U {
  if (!target) {
    return source as T & U;
  }
  if (!source) {
    return target as T & U;
  }
  return mergeWith({}, source, target, (sourceValue, targetValue) => {
    if (isArray(targetValue) && isArray(sourceValue)) {
      switch (mergeArrays) {
        case 'union':
          return unionWith(sourceValue, targetValue, isEqual);
        case 'intersection':
          return intersectionWith(sourceValue, targetValue, isEqual);
        case 'concat':
          return sourceValue.concat(targetValue);
        case 'replace':
          return targetValue;
        default:
          throw new Error(`Unknown merge array strategy: ${mergeArrays as string}`);
      }
    }
    if (isObject(targetValue) && isObject(sourceValue)) {
      return deepMerge(sourceValue, targetValue, mergeArrays);
    }
    return undefined;
  });
}

export function getObjType(obj: any): any {
  const { toString } = Object.prototype;
  const map: Record<string, any> = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
  };
  if (obj instanceof Element) {
    return 'element';
  }
  return map[toString.call(obj)];
}

/**
 * 对象深拷贝
 */
export function deepClone(data: any): any {
  const type = getObjType(data);
  let obj: any;
  if (type === 'array') {
    obj = [];
  } else if (type === 'object') {
    obj = {};
  } else {
    // 不再具有下一层次
    return data;
  }
  if (type === 'array') {
    for (let i = 0, len = data.length; i < len; i++) {
      data[i] = (() => {
        if (data[i] === 0) {
          return data[i];
        }
        return data[i];
      })();
      if (data[i]) {
        delete data[i].$parent;
      }
      obj.push(deepClone(data[i]));
    }
  } else if (type === 'object') {
    Object.keys(data).forEach((key) => {
      if (data) {
        delete data.$parent;
      }
      obj[key] = deepClone(data[key]);
    });
  }
  return obj;
}

/**
 * 对象深拷贝
 */
export function clone(res: Record<string, any>, data: Record<string, any>, notKeys: string[] = []) {
  Object.keys(data).forEach((key) => {
    if (notKeys.indexOf(key) === -1) {
      res[key] = data[key];
    }
  });
}

/**
 * 清空数据
 * @param data
 */
export function clearData(data: Record<string, any>) {
  Object.keys(data || {}).forEach((key) => {
    delete data[key];
  });
}

export const translate = (text: string) => text;

/**
 * 分页方法
 * @param pageNo
 * @param pageSize
 * @param array
 * @returns
 */
export const pagination = function (pageNo: number, pageSize: number, array: any[]) {
  const offset = (pageNo - 1) * pageSize;
  return offset + pageSize >= array.length
    ? array.slice(offset, array.length)
    : array.slice(offset, offset + pageSize);
};

/**
 * 分页方法
 * @param pageNo
 * @param pageSize
 * @param array
 * @returns
 */
export const paginationEx = function (params: Record<string, any>, array: any[]) {
  const offset = (params.page - 1) * params.rows;
  const list =
    offset + params.rows >= array.length
      ? array.slice(offset, array.length)
      : array.slice(offset, offset + params.rows);
  return {
    rows: list,
    total: array.length,
    page: params.page,
    records: list.length,
  };
};

export const uniqueArray = function (arr: any[]) {
  // 数组去重
  return arr.filter(
    (item, index, arr) =>
      // 当前元素，在原始数组中的第一个索引==当前索引值，否则返回当前元素
      arr.indexOf(item, 0) === index,
  );
};

export const toDecimal = (x: any) => {
  let f = parseFloat(x);
  if (isNaN(f)) {
    return 0;
  }
  f = Math.round(x * 100) / 100;
  return f;
};

export const numberToChinese = (num: string) => {
  if (!/^\d*(\.\d*)?$/.test(num)) {
    return 'Number is wrong!';
  }
  const AA = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const BB = ['', '十', '百', '千', '万', '亿', '点', ''];
  const a = ('' + num).replace(/(^0*)/g, '').split('.');
  let k = 0;
  let re = '';
  for (let i = a[0].length - 1; i >= 0; i--) {
    switch (k) {
      case 0:
        re = BB[7] + re;
        break;
      case 4:
        if (!new RegExp('0{4}\\d{' + (a[0].length - i - 1) + '}$').test(a[0])) re = BB[4] + re;
        break;
      case 8:
        re = BB[5] + re;
        BB[7] = BB[5];
        k = 0;
        break;
    }

    if (k % 4 === 2 && a[0].charAt(i + 2) !== '0' && a[0].charAt(i + 1) === '0') re = AA[0] + re;
    if (a[0].charAt(i) !== '0') re = AA[Number(a[0].charAt(i))] + BB[k % 4] + re;
    k++;
  }
  if (a.length > 1) {
    re += BB[6];
    for (let i = 0; i < a[1].length; i++) re += AA[Number(a[1].charAt(i))];
  }
  return re;
};

export const numberToThousandSeparator = (num: string) => {
  const arr = (num + '').split('.');
  const int = arr[0] + '';
  const fraction = arr[1] || '';
  const f = int.length % 3;
  let r = int.substring(0, f);
  for (let i = 0; i < Math.floor(int.length / 3); i++) {
    r += ',' + int.substring(f + i * 3, f + (i + 1) * 3);
  }
  if (f === 0) {
    r = r.substring(1);
  }
  num = r + (fraction ? '.' + fraction : '');
  return num;
};

/**
 *
 * @param {*} fun
 * @returns
 */
export const getFunction = (fun: string) => {
  if (fun) {
    try {
      // eslint-disable-next-line no-eval
      const fn = eval(fun);
      if (typeof fn === 'function') {
        return { res: true, msg: 'ok', fn };
      }
      return { res: false, msg: '此方法不是一个函数' };
    } catch (err) {
      return { res: false, msg: err };
    }
  } else {
    return { res: false, msg: '没设置脚本函数' };
  }
};

/**
 * 用来获取文字宽度
 * @param text
 * @returns
 */
export const getTextWidth = (text: string) => {
  if (!text) {
    return;
  }

  const span = document.createElement('span');
  span.style.fontSize = 'var(--font-size)';
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.innerText = text;
  document.body.appendChild(span);
  const width = span.offsetWidth;
  document.body.removeChild(span);
  return width;
};

/**
 * @description 创建或者关闭全屏加载状态效果
 * @param {Boolean} visible true 打开全屏加载状态，false 关闭全屏加载状态
 */
function fullScreenLoading2(visible: boolean) {
  const loading = document.querySelector('.jcode-loading-spin');
  if (visible) {
    if (!loading) {
      const fragment = new DocumentFragment();
      const loadDom = document.createElement('div');
      loadDom.setAttribute('class', 'jcode-loading-spin');
      const spinSpan = document.createElement('span');
      spinSpan.setAttribute('class', 'jcode-loading-spin-dot');
      for (let i = 0; i < 4; i++) {
        const liDom = document.createElement('i');
        spinSpan.appendChild(liDom);
      }
      loadDom.appendChild(spinSpan);
      fragment.appendChild(loadDom);
      document.body.appendChild(fragment);
    }
  } else if (loading) {
    document.body.removeChild(loading);
  }
}

let fullScreenLoadingTimer: any; // 加载用户信息定时器
let fullScreenLoadingVisible = false;
export function fullScreenLoading(visible: boolean) {
  fullScreenLoadingVisible = visible;
  if (fullScreenLoadingTimer) {
    clearTimeout(fullScreenLoadingTimer);
    fullScreenLoadingTimer = null;
  }
  if (visible) {
    fullScreenLoading2(visible);
    return;
  }

  fullScreenLoadingTimer = setTimeout(() => {
    fullScreenLoading2(fullScreenLoadingVisible);
    fullScreenLoadingTimer = null;
  }, 400);
}

export function upFirst(str: string) {
  if (str == null || str === undefined || str === '') {
    return '';
  }

  if (str === str.toUpperCase()) {
    const strArr = str.split('_').map((_str) => {
      _str = _str.toLowerCase();
      return _str.slice(0, 1).toUpperCase() + _str.slice(1);
    });
    return strArr.join('');
  }

  const strArr = str.slice(0, 1).toUpperCase() + str.slice(1);
  return strArr;
}

export function lowerFirst(str: string, isFlag = true) {
  // 小写的逻辑根据后端来说是如果第一个字母是大写就开始小写，直到下下个字母是小写
  // MIC_ID 就是 miC_ID
  // FPCWxx 就是 fpcWxx
  if (str == null || str === undefined || str === '') {
    return '';
  }

  // 将 xxx_yyy => xxxYyy
  if (isFlag) {
    str = upFirst(str);
  }

  let res = '';
  for (let i = 0, len = str.length; i < len; i++) {
    res += str[i].toLowerCase();
    if (i < len - 1) {
      if (str[i + 1] === str[i + 1].toLowerCase()) {
        break;
      }
    }
    if (i < len - 2) {
      if (str[i + 2] === str[i + 2].toLowerCase()) {
        break;
      }
    }
  }
  if (res.length < str.length) {
    for (let i = res.length, len = str.length; i < len; i++) {
      res += str[i];
    }
  }
  return res;
}

export function debounce(fn: any, delay = 0) {
  let timer: number;

  return function (this: unknown, ...args: any[]) {
    if (timer) {
      window.clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
