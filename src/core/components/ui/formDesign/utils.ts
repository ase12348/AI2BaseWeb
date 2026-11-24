import type { SchemaConfig } from '../cSchemaForm/interface';
import type { DesignComponent } from '../drag/interface';
import type {
  FormDeisgnSaveComponent,
  FormDesignComponent,
  DbTable,
  DbTableColumn,
} from './interface';
import { buildUUID, buildShortUUID } from '../utils/method';
import { pinyin } from 'pinyin-pro';

/**
 * 将中文字符串转换为拼音或首字母
 * @param str 输入字符串
 * @param useFullPinyin 是否使用完整拼音,false则使用首字母
 * @returns 转换后的字符串
 */
function chineseToPinyin(str: string, useFullPinyin = false): string {
  return pinyin(str, {
    pattern: useFullPinyin ? 'pinyin' : 'first',
    toneType: 'none',
    type: 'array',
    v: true,
  }).join('');
}

/**
 * 根据label生成有意义且唯一的名称
 * @param label 组件的label
 * @param existingNames 已存在的名称集合
 * @param prefix 前缀(如 'T_' 或 'F_')
 * @param useFullPinyin 是否使用完整拼音
 * @returns 生成的唯一名称
 */
export function generateUniqueName(
  label: string,
  existingNames: Set<string>,
  prefix = '',
  useFullPinyin = true,
): string {
  if (!label || label.trim() === '') {
    label = 'field';
  }

  // 移除特殊字符并转换为拼音
  let baseName = chineseToPinyin(label.trim(), useFullPinyin);

  // 如果结果为空或过长,使用简化版本
  if (!baseName || baseName.length === 0) {
    baseName = chineseToPinyin(label.trim(), false); // 使用首字母
  }
  if (!baseName || baseName.length === 0) {
    baseName = 'field';
  }

  // 确保以字母开头
  if (!/^[a-zA-Z]/.test(baseName)) {
    baseName = 'f' + baseName;
  }

  // 添加前缀
  let name = prefix + baseName;

  // 限制总长度为30字符(Oracle 12.1及之前版本的限制),预留3位数字后缀空间
  const maxLength = 27; // 30 - 3位数字后缀
  if (name.length > maxLength) {
    // 计算需要截取的baseName长度
    const maxBaseNameLength = maxLength - prefix.length;
    baseName = baseName.substring(0, maxBaseNameLength);
    name = prefix + baseName;
  }

  // 检查唯一性,如果重复则添加数字后缀
  if (existingNames.has(name)) {
    let counter = 1;
    while (existingNames.has(name + counter)) {
      counter++;
    }
    name += counter;
  }

  return name;
}

export const toFormSchema = (data: {
  ver: string;
  form: Record<string, any>;
  components: FormDeisgnSaveComponent[];
}) => {
  const componentList: SchemaConfig[] = formToRuntimeFrom(data.components);
  const formConfig: Record<string, any> = data.form;

  return {
    formConfig,
    componentList,
  };
};

export const toFormDesignSchema = (
  data: Record<string, any>,
  componentsMap: Record<string, FormDesignComponent>,
) => {
  let formConfig: Record<string, any> = {};
  let componentList: DesignComponent[] = [];
  const componentDic: Record<string, DesignComponent> = {};
  // console.log(data, 'data');
  if (data.ver === 'V3') {
    const schemaV3 = data as {
      ver: string;
      form: Record<string, any>;
      components: FormDeisgnSaveComponent[];
    };
    formConfig = schemaV3.form;

    const childrenGroup: Record<string, DesignComponent[]> = {};

    schemaV3.components.forEach((item) => {
      const designComponent = componentsMap[item.type];

      childrenGroup[item.containerId] = childrenGroup[item.containerId] || [];

      const component: DesignComponent = {
        id: item.id,
        name: designComponent?.name || item.name,
        type: item.type,
        dragType: designComponent?.dragType || 'component',
        componentName: designComponent?.componentName || '',
        runtimeType: designComponent?.runtimeType,
        groupId: item.groupId,
        config: item.config,
        isInput: designComponent?.isInput !== false,
        containerId: item.containerId,
        level: item.level,
      };
      component.config.id = component.id;
      if (designComponent?.dragType === 'container') {
        component.children = []; // 如果保存的时候没有添加子组件，再次编辑因为没有children属性，会导致子组件无法添加
      }

      componentDic[component.id] = component;

      childrenGroup[item.containerId].push(component);
    });

    Object.keys(childrenGroup).forEach((key) => {
      if (componentDic[key]) {
        componentDic[key].children = childrenGroup[key];
      }
    });

    componentList = childrenGroup.form || [];
  } else {
    // vue2 版本
    // 表单config
    const formConfigV2 = {
      size: data.size === 'mini' ? 'small' : data.size === 'small' ? 'middle' : 'large',
      labelPosition: data.labelPosition,
      labelWidth: data.labelWidth,
      gutter: data.gutter,
      layerType: data.openType === '1' ? 'modal' : data.openType === '2' ? 'drawer' : 'full',
      width:
        data.openType === '1' ? data.dialogWidth : data.openType === '2' ? data.drawerWidth : 800,
      height: data.dialogHeight || 600,
      vRepeatList: data.vRepeatList,
      historyType: data.historyType,
      codeDataChange: data.changeDataEvent,
      codeInit: data.beforeSetData,
      codeAfterSetData: '',
      codeBeforeSave: data.afterValidateForm,
      codeAfterSave: data.afterSaveEvent,
    };
    // 组件
    const { tabList } = data;
    const componentListV2: any[] = [];
    const componentV2Dic: Record<string, any> = {};
    let level = 1;
    let formTabsId = '';
    const groups: Record<string, any>[] = [];
    if (tabList.length > 1) {
      // 转为最外层为tabs
      tabList.forEach((tab: Record<string, any>) => {
        groups.push({ i: buildUUID(), label: tab.text });
      });
      const id = buildShortUUID();
      formTabsId = id;
      const component: Record<string, any> = {
        id,
        name: '',
        type: 'tabs',
        groupId: '',
        config: {
          componentType: 'tabs',
          id,
          groups,
        },
        containerId: 'form',
        level: 1,
      };
      componentListV2.push(component);
      level = 2;
    }

    tabList.forEach((tab: Record<string, any>, index: number) => {
      getV2Component(
        tab.components,
        componentListV2,
        level,
        formTabsId,
        groups[index],
        componentV2Dic,
      );
    });
    setContainerV2(componentListV2, componentV2Dic);
    const dataV2 = {
      ver: 'V3',
      form: formConfigV2,
      components: componentListV2,
    };
    const res: any = toFormDesignSchema(dataV2, componentsMap);
    return {
      formConfig: res.formConfig,
      componentList: res.componentList,
      componentDic: res.componentDic,
    };
  }

  return {
    formConfig,
    componentList,
    componentDic,
  };
};
const getV2Component = (
  components: any[],
  componentListV2: Record<string, any>,
  level: number,
  containerId: string,
  myGroup: Record<string, any>,
  componentV2Dic: Record<string, any>,
) => {
  components.forEach((item) => {
    // 获取组件类型
    const type = getTypeV2ToV3(item.type);
    const component: Record<string, any> = {
      id: item.prop,
      name: item.label,
      type,
      groupId: myGroup ? myGroup.i : '',
      config: {
        componentType: type,
        id: item.prop,
        ...item,
      },
      containerId: containerId || 'form',
      level,
    };
    if (item.default) {
      component.config.defaultValue = item.default;
    }
    if (['upload', 'uploadimg'].includes(type)) {
      component.config.maxSize = Number(item.maxSize);
    }
    if (item.dataType) {
      component.config.dataType =
        item.dataType === '1' ? 'options' : item.dataType === '2' ? 'dataItem' : 'dataSource';
    }
    if (item.ptype === 'card') {
      component.containerId = item.pid;
    }
    if (type === 'inputLayer') {
      component.config.layerWidth = item.width;
      delete component.config.width;
    }
    if (['tabs', 'collapse'].includes(type)) {
      const groups: Record<string, any>[] = [];
      item.tabList.forEach((group: Record<string, any>) => {
        groups.push({ i: buildUUID(), label: group.text });
      });
      componentV2Dic[item.prop] = { groups, level: level + 1 };
      component.config.groups = groups;
    } else if (['card'].includes(type)) {
      componentV2Dic[item.prop] = { groups: [], level: level + 1 };
    } else if (['tableLayout'].includes(type)) {
      const cells = item.cells.map((cell: Record<string, any>) => ({
        id: buildShortUUID(),
        ...cell,
      }));
      componentV2Dic[item.prop] = { cells, level: level + 1 };
      component.config.cells = cells;
    } else if (type === 'createUser') {
      component.config.mode = 'create';
    } else if (type === 'modifyUser') {
      component.config.mode = 'modify';
    } else if (type === 'label') {
      component.config.content = item.label;
      component.config.align = item.contentPosition;
      component.config.size = item.fontSize;
    } else if (type === 'rate') {
      component.config.count = item.max;
      component.config.texts =
        (item.texts || []).map((text: string) => ({ i: buildUUID(), value: text })) || [];
    } else if (type === 'date') {
      component.config.picker = item.dateType;
      component.config.format = item.format.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD');
    } else if (type === 'dateRange') {
      component.config.format = item.format.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD');
      component.config.picker =
        item.dateType === 'daterange'
          ? 'date'
          : item.dateType === 'monthrange'
            ? 'month'
            : 'dateTime';
      component.config.defaultValue = item.default.split(' - ');
    }
    if (item.subfield) {
      component.config.isSubTable = item.subfield;
    }
    delete component.config.children;
    delete component.config.subfield;
    componentListV2.push(component);
    if (item.children) {
      const myLevel = level + 1;
      getV2Component(item.children, componentListV2, myLevel, item.prop, {}, componentV2Dic);
    }
  });
};
const setContainerV2 = (comList: any[], componentV2Dic: Record<string, any>) => {
  comList.forEach((item: any) => {
    if (item.config.pid && ['collapse', 'tab'].includes(item.config.ptype)) {
      const keys = item.config.pid.split('.');
      if (componentV2Dic[keys[0]]) {
        item.containerId = keys[0];
        item.groupId = componentV2Dic[keys[0]].groups[keys[1]].i;
        item.level = componentV2Dic[keys[0]].level;
      }
    } else if (['card'].includes(item.config.ptype)) {
      item.level = componentV2Dic[item.containerId].level;
      item.groupId = '';
    } else if (['tableLayout'].includes(item.config.ptype)) {
      const keys = item.config.pid.split('.');
      if (componentV2Dic[keys[0]]) {
        item.containerId = keys[0];
        item.groupId = componentV2Dic[keys[0]].cells[keys[1]].id;
        item.level = componentV2Dic[keys[0]].level;
      }
    }
  });
};
const getTypeV2ToV3 = (type: string) => {
  let res = type;
  switch (type) {
    case 'tab':
      res = 'tabs';
      break;
    case 'lable':
      res = 'label';
      break;
    case 'texteditor':
      res = 'textEditor';
      break;
    case 'layerselect':
      res = 'inputLayer';
      break;
    case 'timerange':
      res = 'timeRange';
      break;
    case 'datetime':
      res = 'date';
      break;
    case 'datetimerange':
      res = 'dateRange';
      break;
    case 'areaselect':
      res = 'areaSelect';
      break;
    case 'layerbmap':
      res = 'inputMap';
      break;
    case 'createuser':
      res = 'createUser';
      break;
    case 'modifyuser':
      res = 'modifyUser';
      break;
    case 'createtime':
      res = 'createTime';
      break;
    case 'modifytime':
      res = 'modifyTime';
      break;
    case 'viewtable':
      res = 'viewTable';
      break;
    case 'color':
      res = 'inputColor';
      break;
    case 'treeselect':
      res = 'treeSelect';
      break;
  }
  return res;
};
export const toFormSaveSchema = (
  formConfig: Record<string, any>,
  componentList: DesignComponent[],
) => {
  const schema: {
    ver: string;
    form: Record<string, any>;
    components: FormDeisgnSaveComponent[];
    db: Record<string, any>;
  } = {
    ver: 'V3',
    form: {
      ...formConfig,
    },
    components: [],
    db: {},
  };
  forEachComponents(componentList || [], schema.components);
  return schema;
};

/**
 *
 * @param list
 * @param res
 */
const forEachComponents = (list: DesignComponent[], res: FormDeisgnSaveComponent[]) => {
  list.forEach((item) => {
    if (item.type === 'pkey') {
      return;
    }
    const component: FormDeisgnSaveComponent = {
      id: item.id,
      name: item.name,
      type: item.type,
      runtimeType: item.runtimeType || item.componentName || item.type,
      groupId: item.groupId || '',
      config: item.config,
      containerId: item.containerId,
      level: item.level,
    };

    if (item.dragType === 'container') {
      const children = item.children || [];
      forEachComponents(children, res);
    }
    res.push(component);
  });
};

/**
 * v3版本转化方法,转化成具体运行的表单json数据
 * @param list
 * @returns
 */
const formToRuntimeFrom = (list: FormDeisgnSaveComponent[]) => {
  const childrenGroup: Record<string, SchemaConfig[]> = {};
  const componentDic: Record<string, SchemaConfig> = {};

  list.forEach((item) => {
    childrenGroup[item.containerId] = childrenGroup[item.containerId] || [];
    const component: SchemaConfig = {
      id: item.id,
      type: item.runtimeType,
      slot: item.groupId,
      config: {},
      rule: [],
    };

    if (item.config) {
      Object.keys(item.config).forEach((key) => {
        if (key === 'required') {
          if (item.config.required) {
            component.rule?.push({ required: true, message: item.config.requiredMsg || '请输入' });
          }
          return;
        }

        if (key === 'patterns') {
          item.config.patterns?.forEach((pattern: { msg: string; reg: string }) => {
            if (pattern.reg && pattern.msg) {
              component.rule?.push({
                pattern: new RegExp(pattern.reg),
                message: `请输入${pattern.msg || ''}`,
              });
            }
          });
          return;
        }

        // @ts-ignore
        component.config[key] = item.config[key];
      });
    }
    if (item.type === 'pkey') {
      // @ts-ignore
      component.config.isPkey = true;
    }
    childrenGroup[item.containerId].push(component);

    componentDic[item.id] = component;
  });

  Object.keys(childrenGroup).forEach((key) => {
    if (componentDic[key]) {
      componentDic[key].children = childrenGroup[key];
    }
  });

  return childrenGroup.form;
};

/**
 * 重置表格
 */
export const resetTable = (componentList: DesignComponent[], tableList: DbTable[]) => {
  const tableMap: Record<string, DbTable> = {};
  tableList.forEach((item) => {
    tableMap[item.name] = item;
  });
  forEachComponentsToResetTable(componentList, tableMap, []);
};

const forEachComponentsToResetTable = (
  list: DesignComponent[],
  tableMap: Record<string, DbTable>,
  columns: DbTableColumn[],
) => {
  list.forEach((item) => {
    if (item.config.table) {
      const table = tableMap[item.config.table];
      if (table) {
        if (item.config.field) {
          const column = table.columns.find((column) => column.name === item.config.field);
          if (!column) {
            item.config.field = '';
          }
        }
        // item.config.field
      } else if (item.config.isSubTable) {
        const column = columns.find((column) => column.name === item.config.field);
        if (!column) {
          item.config.field = '';
        }
      } else {
        item.config.table = '';
        item.config.field = '';
      }
    }

    if (item.dragType === 'container') {
      const children = item.children || [];
      forEachComponentsToResetTable(children, tableMap, tableMap[item.config.table]?.columns || []);
    }
  });
};
