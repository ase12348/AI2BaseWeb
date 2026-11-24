import type { VNode } from 'vue';
import type { FormAuthConfigType } from '/#/form';

export interface PageSchemaConfig {
  /**
   * @zh id
   */
  id?: string;
  /**
   * @zh 类型
   */
  type?: string;
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
   * 组件dom对象
   */
  $ref?: any;
}

/**
 * 应用页面配置
 */
export interface AppPageConfig {
  /**
   * 页面标题
   */
  title: string;
  /**
   * 是否不是菜单(不需要进行权限过滤，但还是需要登录状态的)
   */
  isNotMenu?: boolean;
  /**
   * 是否不是页签
   */
  isNotTab?: boolean;
  /**
   * 是否不需要权限验证（不用进行登录者权限校验）
   */
  isNotAuth?: boolean;
  /**
   * 不能被关闭
   */
  isNotClosed?: boolean;
  /**
   * 是否支持弹窗打开
   */
  isLayer?: boolean;
  /**
   * 列的信息
   */
  columns?: ColumnConfigType[];

  /**
   * 按钮信息
   */
  buttons?: ButtonType[] | ButtonGroupType[];

  /**
   * 表单信息
   */
  forms?: FormAuthConfigType[];

  /**
   * 子页面，用作权限设置。
   */
  childPages?: {
    name: string;
    id: string;
    notButtons?: string[];
    notColumns?: string[];
    notForms?: string[];
    notPages?: string[];
  }[];
}

export interface ButtonGroupType {
  label: string;
  id: string;
  buttonList: ButtonType[];
}

export interface ButtonType {
  /**
   * 按钮名称
   */
  label?: string;
  /**
   * 按钮ID
   */
  prop?: string;
  /**
   * 按钮类型
   */
  type?: string;
  /**
   * 集合ID
   */
  groupId?: string;
  /**
   * 按钮图标
   */
  icon?: string;
  /**
   * 按钮是否可点击
   */
  disabled?: boolean;
  /**
   * 按钮是否隐藏
   */
  hidden?: boolean;

  /**
   * 按钮分类
   */
  classify?: string;
  /**
   * 按钮宽度
   */
  width?: number;
  /**
   * 是否需要标红
   */
  danger?: boolean;
  /**
   * 按钮点击事件
   */
  click?: (row?: Record<string, any>, rowIndex?: number) => void;
  /**
   * @zh 按钮点击动作,默认根据点击按钮方法来。upload上传 \ exportExcel导出 \ importExcel导入
   */
  action?: string;
  /**
   * @zh 按钮点击弹窗组件
   */
  layerName?: string | VNode;
  /**
   * @zh 按钮点击弹窗组件标题
   */
  layerTitle?: string;
  /**
   * @zh 按钮点击弹窗组件类型
   */
  layerType?: string;
  /**
   * @zh 按钮点击弹窗组件宽度
   */
  layerWidth?: number;
  /**
   * @zh 按钮点击弹窗组件高度
   */
  layerHeight?: number;
  /**
   * @zh 按钮点击弹窗组件配置
   */
  layerFormConfig?: Record<string, any>;
  /**
   * @zh 按钮点击弹窗组件配置
   */
  layerParam?: Record<string, any>;
  /**
   * @zh 弹窗确认后调用
   * @param data
   * @returns
   */
  afterOk?: (data: any) => void;
  /**
   * @zh 弹窗关闭后调用
   * @param data
   * @returns
   */
  afterClose?: () => void;

  /**
   * @zh 上传文件类型
   */
  uploadAccept?: string;
  /**
   * @zh 上传文件类型
   */
  uploadCallback?: (data: any) => any;
  /**
   * @zh 文件上传成功后调用
   */
  uploadSuccess?: (data: any) => void;

  /**
   * 按钮子集
   */
  children?: ButtonType[];

  /**
   * @zh 导出数据是否需要勾选,在action为exportExcel导出有效
   */
  isExportCheck?: boolean;

  /**
   * @zh 导出数据接口地址,在action为exportExcel导出有效
   */
  exportUrl?: string;

  /**
   * @zh 导入Excel配置编码,在action为importExcel导入有效
   */
  importCode?: string;
}

export interface ColumnType {
  /**
   * @zh 显示的标题
   */
  label?: string;
  /**
   * @zh 对应列内容的字段名，也可以使用 property 属性
   */
  prop: string;
  /**
   * @zh 列的宽度
   */
  width?: number;
  /**
   * @zh 对应列的最小宽度，与 width 的区别是 width 是固定的，minWidth 会把剩余宽度按比例分配给设置了 minWidth 的列
   */
  minWidth?: number;
  /**
   * @zh 列是否固定在左侧或者右侧，true 表示固定在左侧
   * @defaultValue false
   */
  fixed?: boolean | `left` | `right`;
  /**
   * @zh 对应列是否可以通过拖动改变宽度（需要在 el-table 上设置 border 属性为真）
   * @defaultValue true
   */
  resizable?: boolean;
  /**
   * @zh 对齐方式
   * @defaultValue left
   */
  align?: 'left' | 'center' | 'right';
  /**
   * @zh 表头对齐方式，若不设置该项，则使用表格的对齐方式
   * @defaultValue -
   */
  headerAlign?: 'left' | 'center' | 'right';
  /**
   * @zh 是否不自动换行
   * @defaultValue false
   */
  isNotAutoWrap?: boolean;
  /**
   * @zh 是否开启当前列排序
   * @defaultValue false
   */
  sortable?: boolean;

  /**
   * @zh 是否是必填项
   * @defaultValue false
   */
  required?: boolean;
  /**
   * @zh 是否是模糊查询列
   * @defaultValue false
   */
  isKeyword?: boolean;

  /**
   * @zh 是否添加过滤
   */
  isFilter?: boolean;

  /**
   * @zh 输入类型
   */
  inputType?: string;
  /**
   * @zh 列配置信息
   */
  config?: ColConfig;

  children?: ColumnType[];
}

export interface ColConfig {
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
   * @zh 用来格式化内容
   */
  formatter?: (data: {
    row: Record<string, any>;
    column: any;
    cellValue: any;
    index: any;
  }) => VNode;
  /**
   * @zh 过滤的参数别名，不设置默认用prop
   */
  filteProp?: string;
  /**
   * @zh 关联ID，部门，数据视图有效果
   */
  upId?: string;
  /**
   * @zh 关联值, 部门，数据视图有效果
   */
  upValue?: string;
  /**
   * @zh 上级参数别名
   */
  upKey?: string;
  /**
   * @zh 是否多选
   */
  multiple?: boolean;
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
  // 评分配置
  /**
   * @zh 分数是否显示
   */
  showScore?: boolean;
  /**
   * @zh 总数
   */
  count?: number;
  /**
   * @zh 文本是否显示
   */
  showText?: boolean;
  /**
   * @zh 文本配置
   */
  texts?: any[];
  /**
   * @zh 是否是上传图片
   */
  isUploadImg?: boolean;

  [propName: string]: any;
}

export interface ColumnConfigType {
  /**
   * id
   */
  id?: string;
  /**
   * 名称
   */
  label?: string;
  /**
   * 列数据
   */
  list: ColumnType[];
}
