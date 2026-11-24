import type { VNode } from 'vue';

export interface columns {
  /**
   * @zh 显示的标题
   */
  label?: string;
  /**
   * @zh 对应列内容的字段名
   */
  prop: string;
  /**
   * @zh 对应列内容的字段名
   */
  field?: string;
  /**
   * @zh 列的宽度
   */
  width?: string;
  /**
   * @zh 对应列的最小宽度，与 width 的区别是 width 是固定的，minWidth 会把剩余宽度按比例分配给设置了 minWidth 的列
   */
  minWidth?: string;
  /**
   * @zh 列是否固定在左侧或者右侧，true 表示固定在左侧
   * @defaultValue false
   */
  fixed?: boolean | 'left' | 'right';
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
   * @defaultValue -
   */
  isNotAutoWrap?: boolean;
  /**
   * @zh 头部是否不自动换行
   * @defaultValue -
   */
  isNotHeaderAutoWrap?: boolean;
  /**
   * @zh 是否开启当前列排序
   * @defaultValue false
   */
  sortable?: boolean;
  /**
   * @zh 是否统计
   * @defaultValue false
   */
  isSummary?: boolean;
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
   * @zh 获取输入类型
   * @param row
   * @returns
   */
  getInputType?: (row: Record<string, any>) => string;
  /**
   * @zh 是否是输入框
   */
  isInputType?: (row: Record<string, any>) => boolean;
  /**
   * @zh 列数据项配置
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
     * @zh 用来格式化内容
     */
    formatter?: (data: { row: object; column: any; cellValue: any; index: any }) => VNode;
    /**
     * @zh 用来格式化表头
     */
    titleFormatter?: (data: { title: string }) => VNode;
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

    /**
     * @zh 默认值
     */
    defaultValue?: any;

    /**
     * @zh 单据编码
     */
    code?: string;

    /**
     * @zh 是否行多选添加
     */
    isMultiSelectToAddRow?: boolean;
  };
  /**
   * @zh 子列
   */
  children?: columns[];

  [propName: string]: any;
}
