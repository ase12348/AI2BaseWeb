export interface SchemaConfig {
  /**
   * @zh id
   */
  id?: string;
  /**
   * @zh 绑定表
   */
  table?: string;
  /**
   * @zh 绑定字段
   */
  field?: string;
  /**
   * @zh 类型
   */
  type: string;
  /**
   * @zh 动态获取输入框类型
   * @returns
   */
  getInputType?: (data: Record<string, any>) => string;
  /**
   * @zh 配置信息
   */
  config?: {
    /**
     * @zh 数据类型
     */
    dataType?: string;
    /**
     * @zh 数据编码
     */
    dataCode?: string;
    /**
     * @zh 数据
     */
    options?: Record<string, any>;
    /**
     * @zh 过滤数据id
     */
    dataFilterIds?: string[];
    /**
     * @zh 关联ID，部门，数据视图有效果
     */
    upId?: string;
    /**
     * @zh 上级参数别名
     */
    upKey?: string;
    /**
     * @zh 获取上级参数
     * @param data
     * @returns
     */
    getUpConfig?: (data: Record<string, any>) => Record<string, any> | undefined;
    /**
     * @zh 值键值
     */
    valueKey?: string;
    /**
     * @zh 显示键值
     */
    labelKey?: string;
    /**
     * @zh id键值
     */
    idKey?: string;
    /**
     * @zh 父级键值
     */
    pidKey?: string;
    /**
     * @zh 数据源参数
     */
    params?: Record<string, any>;

    [propName: string]: any;
  };
  /**
   * @zh 插槽名称
   */
  slot?: string;
  /**
   * @zh 子集
   */
  children?: SchemaConfig[];
  /**
   * @zh 校验规则
   */
  rule?: Record<string, any> | Array<Record<string, any>>;
  /**
   * @zh 父级表格ID
   */
  parentTableId?: string;

  /**
   * @zh 组件对象
   */
  $ref?: any;
}

export interface SchemaRuntimeConfig {
  /**
   * @zh id
   */
  id: string;
  /**
   * @zh 插槽名称
   */
  slot?: string;
  /**
   * @zh 子集
   */
  children: SchemaRuntimeConfig[];
}
