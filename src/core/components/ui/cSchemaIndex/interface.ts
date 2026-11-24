export interface PageSchemaConfig {
  /**
   * @zh id
   */
  id?: string;
  /**
   * @zh 类型
   */
  type: string;
  /**
   * @zh 配置信息
   */
  config?: Record<string, any>;
  /**
   * @zh 插槽名称
   */
  slot?: string;
  /**
   * @zh 是否显示
   */
  display?: boolean;
  /**
   * @zh 子集
   */
  children?: PageSchemaConfig[];

  /**
   * @zh 组件dom对象
   */
  $ref?: any;
}

export interface FormLayerParamType {
  /**
   * 表单标题
   */
  title: string;
  /**
   * @zh 表单名称
   */
  name: string;
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
   * @zh 参数
   */
  param?: Record<string, any>;

  /**
   * @zh 是否有按钮
   */
  hasBtns?: boolean;
  /**
   * @zh 是否有保存按钮
   */
  hasSaveBtn?: boolean;
  /**
   * @zh 是否有取消按钮
   */
  hasCloseBtn?: boolean;
  /**
   * @zh 是否弹窗头部
   */
  hasHeader?: boolean;
  /**
   * @zh 弹窗按钮文字
   */
  btnText?: string;
  /**
   * 副标题（返回h函数）
   */
  subtitle?: any;
  /**
   * @zh 关闭时销毁抽屉内的元素
   */
  destroyOnClose?: boolean;
  /**
   * @zh 弹窗是否隐藏
   */
  hidden?: boolean;
  /**
   * 组件配置
   */
  config?: Record<string, any>;

  /**
   * @zh 保存成功后调用方法
   */
  afterOk?: () => void;
  /**
   * @zh 关闭后方法
   */
  afterClose?: () => void;
  /**
   * @zh 取消后方法
   */
  afterCancel?: () => void;
}
