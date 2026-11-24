export interface DesignComponent {
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
   * @zh 组件类型
   */
  dragType: string;
  /**
   * @zh 组件类型
   */
  componentName: string;
  /**
   * @zh 组件类型(表单实际运行组件)
   */
  runtimeType?: string;
  /**
   * @zh 所在容器id
   */
  containerId: string;
  /**
   * @zh 是否是输入组件
   */
  isInput: boolean;
  /**
   * @zhe 层级
   */
  level: number;
  /**
   * @zh 配置信息
   */
  config: Record<string, any>;
  /**
   * @zh 所在容器分类
   */
  groupId?: string;
  /**
   * @zh 子组件
   */
  children?: DesignComponent[];
  /**
   * @zh 是否是新增组件
   */
  isNewAdd?: boolean;
}
