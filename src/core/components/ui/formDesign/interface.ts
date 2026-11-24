export interface FormDesignComponents {
  /**
   * @zh 组件集合名称
   */
  name: string;
  /**
   * @zh 组件集
   */
  children: FormDesignComponent[];
}

export interface FormDesignComponent {
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
   * @zh 是否是输入组件
   */
  isInput?: boolean;
  /**
   * @zh 不绑定数据表
   */
  bindTable?: boolean;
  /**
   * @zh 是否有两个占位提示
   */
  hasTwoPlaceholder?: boolean;
  /**
   * @zh 是否有占位提示
   */
  hasPlaceholder?: boolean;
  /**
   * @zh 是否有span设置
   */
  hasSpan?: boolean;
  /**
   * @zh 是否有标题设置
   */
  hasLabel?: boolean;
  /**
   * @zh 标题项名称
   */
  labelTitle?: string;
  /**
   * @zh 是否有基础设置
   */
  hasBase?: boolean;
  /**
   * @zh 字段类型
   */
  csType?: string;
  /**
   * @zh 字段长度
   */
  fieldLen?: number;
}

export interface DbTable {
  /**
   * @zh id
   */
  id: string;
  /**
   * @zh 名称
   */
  name: string;
  /**
   * @zh 说明
   */
  comment: string;
  /**
   * @zh 列
   */
  columns: DbTableColumn[];
}

export interface DbTableColumn {
  /**
   * @zh 名称
   */
  name: string;
  /**
   * @zh 类型
   */
  csType: string;
  /**
   * @zh 是否自增
   */
  isIdentity: boolean;
  /**
   * @zh 是否是主键
   */
  isPrimary: boolean;
  /**
   * @zh 是否为空
   */
  isNullable: boolean;
  /**
   * @zh 说明
   */
  coment: string;
}

/**
 * @zh 组件保存数据格式
 */
export interface FormDeisgnSaveComponent {
  id: string;
  name: string;
  type: string;
  runtimeType: string;
  groupId: string;
  config: Record<string, any>;
  containerId: string;
  level: number;
}
