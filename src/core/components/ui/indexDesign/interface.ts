export interface IndexDesignComponents {
  /**
   * @zh 组件集合名称
   */
  name: string;
  /**
   * @zh 组件集
   */
  children: IndexDesignComponent[];
}

export interface IndexDesignComponent {
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
  icon: string;
  /**
   * @zh 组件类型
   */
  dragType?: string;
  /**
   * @zh 组件类型(设计组件)
   */
  componentName?: string;
  /**
   * @zh 组件类型(表单实际运行组件)
   */
  runtimeType?: string;

  /**
   * @zh 是否有基础设置
   */
  hasBase?: boolean;
}

/**
 * @zh 组件保存数据格式
 */
export interface IndexDeisgnSaveComponent {
  id: string;
  name: string;
  type: string;
  runtimeType: string;
  groupId: string;
  config: Record<string, any>;
  containerId: string;
  level: number;
}
