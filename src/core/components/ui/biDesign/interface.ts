export interface BiDesignComponent {
  /**
   * @zh id
   */
  id: string;
  /**
   * @zh 组件名
   */
  name: string;
  /**
   * @zh 组件类型
   */
  type: string;
  /**
   * @zh 所在图层id
   */
  layerId: string;
  /**
   * @zh 组件名称
   */
  componentName: string;
  /**
   * @zh 是否显示
   */
  display: boolean;
  /**
   * @zh 是否锁住
   */
  lock: boolean;
  /**
   * @zh 配置信息
   */
  config: Record<string, any>;
  /**
   * @zh 组件实例
   */
  $refs?: any;
}

export type Layout = Array<BiDesignComponent>;
