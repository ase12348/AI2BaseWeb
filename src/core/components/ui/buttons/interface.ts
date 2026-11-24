import { VNode } from 'vue';

export interface buttonItem {
  /**
   * @zh 按钮名称
   */
  label?: string;
  /**
   * @zh 按钮ID
   */
  prop: string;
  /**
   * @zh 按钮类型
   */
  type?: string;
  /**
   * @zh 集合ID
   */
  groupId?: string;
  /**
   * @zh 按钮图标
   */
  icon?: string;
  /**
   * @zh 按钮是否可点击
   */
  disabled?: boolean;
  /**
   * @zh 是否是警告按钮
   */
  danger?: boolean;
  /**
   * @zh 是否是幽灵按钮
   */
  ghost?: boolean;
  /**
   * @zh 按钮子集
   */
  children?: buttonItem[];
  /**
   * @zh 按钮宽度
   */
  width?: number;
  /**
   * @zh 按钮点击方法
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
   * @zh 弹窗给组件参数
   */
  layerParam?: Record<string, any>;
  /**
   * @zh 获取弹窗参数
   * @returns
   */
  layerGetParam?: () => Record<string, any>;
  /**
   * @zh 弹窗是否显示按钮
   */
  layerHasBtns?: boolean;

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

  loading?: boolean;

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
