export interface FormSchemaConfig {
  /**
   * @zh id
   */
  id?: string;
  /**
   * @zh 名称
   */
  name?: string;
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
  type?: string;
  /**
   * @zh 插槽名称
   */
  slot?: string;
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
    getUpConfig?: (data: {
      formData: Record<string, any>;
      index: number;
      row: Record<string, any>;
      tableData: Record<string, any>[];
      parentRow: Record<string, any>;
      config: Record<string, any>;
    }) => Record<string, any> | undefined;
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
    /**
     * @zh 默认数据
     */
    defaultValue?: any;
    /**
     * @zh 赋值字段名，实现不同组件使用同一个字段的值
     */
    valueIdKey?: string;
    /**
     * @zh 组件值为非string类型时要加
     */
    isNotString?: boolean;

    [propName: string]: any;
  };
  /**
   * @zh 子集
   */
  children?: FormSchemaConfig[];
  /**
   * @zh 校验规则
   */
  rule?: RuleType[];

  /**
   * @zh 父级表格ID
   */
  parentTableId?: string;
}

export interface FormAuthSchemaConfig {
  /**
   * 名称
   */
  name: string;
  /**
   * id
   */
  id?: string;
  /**
   * 绑定表
   */
  table?: string;
  /**
   * 绑定字段
   */
  field?: string;
  /**
   * @zh 插槽名称
   */
  slot?: string;
  /**
   * @zh 组件类型
   */
  type?: string;
  /**
   * 组件配置
   */
  config?: {
    span?: number;
    labelWidth?: number;
    groups?: { i: string; label: string; span?: number; labelWidth?: number }[];
    [props: string]: any;
  };
  /**
   * 子集
   */
  children?: FormAuthSchemaConfig[];
}

export interface FormAuthConfigType {
  /**
   * 表单组件地址
   */
  path: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 是否是流程表单
   */
  isWorkflow?: boolean;
  /**
   * 表单配置字段信息
   */
  schema: FormAuthSchemaConfig[];
}

export interface FormPageConfigType {
  pageId: string;
  /**
   * 表单信息
   */
  forms: FormAuthConfigType[];
}

export interface FormLayerParamType {
  /**
   * 表单标题
   */
  title: string;
  /**
   * @zh 表单名称
   */
  name: string | any;
  /**
   * @zh 类型，弹窗 modal ，全屏弹窗 full ，抽屉 drawer
   */
  type?: string;
  /**
   * @zh 宽度
   */
  width?: number;
  /**
   * @zh 高度
   */
  height?: number;
  /**
   * @zh 是否有按钮
   */
  hasBtns?: boolean;
  /**
   * @zh 是否有保存按钮
   */
  hasSaveBtn?: boolean;
  /**
   * @zh 弹窗按钮文字
   */
  btnText?: string;
  /**
   * @zh 关闭时是否销毁抽屉内的元素
   */
  destroyOnClose?: boolean;
  /**
   * @zh 弹窗是否隐藏
   */
  hidden?: boolean;
  /**
   * @zh 是否有头部
   */
  hasHeader?: boolean;
  /**
   * @zh 参数
   */
  param?: Record<string, any>;
  /**
   * 组件配置
   */
  config?: Record<string, any>;
  /**
   * @zh 保存成功后调用方法
   */
  afterOk?: (data: any) => void;
  /**
   * @zh 关闭后方法
   */
  afterClose?: () => void;
}

export interface RuleType {
  /**
   * @zh 枚举类型
   */
  enum?: string;
  /**
   * @zh 字段长度
   */
  len?: number;
  /**
   * @zh 最大长度
   */
  max?: number;
  /**
   * @zh 最小长度
   */
  min?: number;
  /**
   * @zh 正则表达式校验
   */
  pattern?: RegExp | string;
  /**
   * @zh 是否必选
   */
  required?: boolean;
  /**
   * @zh 校验触发的时机
   */
  trigger?: 'blur' | 'change' | ['change', 'blur'] | string;
  /**
   * @zh 内建校验类型
   */
  type?: string;
  /**
   * @zh 自定义校验
   */
  validator?: Function;
  /**
   * @zh 校验文案
   */
  message?: string;
  /**
   * @zh 表名
   */
  lr_table?: string;
  /**
   * @zh 表主键名
   */
  lr_key?: string;

  [propName: string]: any;
}
