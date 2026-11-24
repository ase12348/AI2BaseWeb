import { isNullOrEmpty } from './is';
/**
 * 小数四舍五入
 * @param {*} val
 * @param {*} len
 */
export function getFixed(val = 0, len = 2) {
  return Number(val.toFixed(len));
}

export const getDpi = () => {
  if (!(window as any).jcode_dpi) {
    const div = document.createElement('DIV');
    div.style.cssText =
      'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden';
    document.body.appendChild(div);
    (window as any).jcode_dpi = div.offsetHeight;
    div.remove();
  }
  return (window as any).jcode_dpi;
};

export const toPt = (t: any) => Number(t) * (72 / getDpi());

export const toPx = (t: any) => Number(t) * (getDpi() / 72);
/**
 * 获取像素设置值
 * @param {*} val
 * @param {*} defval
 */
export const getPx = (val: any, defval: any = '', isPt = false) => {
  if (isNullOrEmpty(val)) val = defval;
  if (isNullOrEmpty(val)) return '';
  if (isPt) {
    val = toPt(val) + '';
    if (val.indexOf('%') === -1) {
      val += 'pt';
    }
  } else {
    val += '';
    if (val.indexOf('%') === -1) {
      val += 'px';
    }
  }

  return val;
};

/**
 * 毫米转pt
 * @param {*} t
 * @returns
 */
export const mmToPt = (t: any) =>
  // mm 转 pt
  (72 / 25.4) * t;

export const toDecimal = (x: any) => {
  let f = parseFloat(x);
  if (isNaN(f)) {
    return 0;
  }
  f = Math.round(x * 100) / 100;
  return f;
};
