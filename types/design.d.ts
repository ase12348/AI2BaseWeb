import type { FormSchemaConfig } from '/#/form';
/**
 * 设置配置信息
 */
export interface DesignConfigSchema {
  /**
   * 配置信息初始化
   */
  init: () => Record<string, any>;
  /**
   * 配置表单初始化
   */
  configInit?: (data: {
    configRef?: any;
    componentDic: Record<string, any>;
    components: Record<string, any>[];
    configData: Record<string, any>;
    globalConfig?: Record<string, any>;
    codeTableList?: Record<string, any>[];
    pages?: Record<string, any>[];
    pageActive?: number;
    /**
     * 页面编排里的页面设计组件列表
     */
    designComponents?: Record<string, any>[];
    inputParams?: Record<string, any>;
    component: Record<string, any>;
  }) => void;
  /**
   * 配置改变事件
   */
  configChange?: (data: {
    configRef?: any;
    configData: Record<string, any>;
    component: Record<string, any>;
    value: any;
    data: any;
    col: Record<string, any>;
    index: number;
    tableData: Record<string, any>[];
    type: string;
    row?: Record<string, any>;
  }) => void;
  /**
   * 组件添加事件
   */
  addComponent?: (data: {
    container: Record<string, any>;
    groupId: string;
    configData: Record<string, any>;
  }) => void;

  /**
   * 组件配置校验
   */
  validate?: (data: { configData: Record<string, any>; errorTip: Function }) => boolean;
  configForm: FormSchemaConfig[];

  /**
   * 打印设计器
   * @returns
   */
  getHtml?: (config: Record<string, any>, isPreview: boolean) => string | Promise<string>;
}

/**
 * 设计打印组件
 */
export interface DesignPrintComponent {
  /**
   * 组件名称
   */
  label: string;
  /**
   * 组件类型
   */
  type: string;

  config: DesignPrintComponentConfig;

  [propName: string]: any;
}
export interface DesignPrintComponentConfig {
  /**
   * 组件唯一标识
   */
  id: string;
  /**
   * 文本
   */
  label?: string;
  /**
   * 组件类型
   */
  componentType?: string;

  [propName: string]: any;
}
