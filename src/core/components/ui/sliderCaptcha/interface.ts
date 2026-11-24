import type { CSSProperties } from 'vue';

/**
 * 验证通过数据
 */
export interface CaptchaVerifyPassingData {
  /**
   * 是否通过
   */
  isPassing: boolean;
  /**
   * 耗时（秒）
   */
  time: number | string;
}

/**
 * 滑动过程数据
 */
export interface SliderMoveData {
  /**
   * 原始事件
   */
  event: MouseEvent | TouchEvent;
  /**
   * 拖动偏移量
   */
  moveDistance: number;
  /**
   * 当前横向坐标
   */
  moveX: number;
}

export interface SliderCaptchaProps {
  class?: any;
  /**
   * @description 滑块的样式
   * @default {}
   */
  actionStyle?: CSSProperties;

  /**
   * @description 滑块条的样式
   * @default {}
   */
  barStyle?: CSSProperties;

  /**
   * @description 内容的样式
   * @default {}
   */
  contentStyle?: CSSProperties;

  /**
   * @description 组件的样式
   * @default {}
   */
  wrapperStyle?: CSSProperties;

  /**
   * @description 验证成功的提示
   * @default '验证通过'
   */
  successText?: string;

  /**
   * @description 提示文字
   * @default '请按住滑块拖动'
   */
  text?: string;
}
