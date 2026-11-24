export interface LayoutItemRequired {
  /**
   * @zh 名称
   */
  name: string;
  /**
   * @zh 宽
   */
  w: number;
  /**
   * @zh 高
   */
  h: number;
  /**
   * @zh x坐标
   */
  x: number;
  /**
   * @zh y坐标
   */
  y: number;
  /**
   * @zh id
   */
  i: string;
  /**
   * @zh 组件名
   */
  componentName: string;
}
export type LayoutItem = LayoutItemRequired & {
  /**
   * @zh 最小宽
   */
  minW?: number;
  /**
   * @zh 最小高
   */
  minH?: number;
  /**
   * @zh 最大宽
   */
  maxW?: number;
  /**
   * @zh 最大高
   */
  maxH?: number;
  /**
   * @zh 是否可拖动
   */
  isDraggable?: boolean;
  /**
   * @zh 是否可缩放
   */
  isResizable?: boolean;
  /**
   * @zh 配置信息
   */
  config?: Record<string, any>;
};

export type Layout = Array<LayoutItem>;
