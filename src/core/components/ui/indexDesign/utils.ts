import type { DesignComponent } from '../drag/interface';
import type { PageSchemaConfig } from '../cSchemaIndex/interface';
import type { IndexDeisgnSaveComponent, IndexDesignComponent } from './interface';

export const toIndexSaveSchema = (
  indexPageConfig: Record<string, any>,
  componentList: DesignComponent[],
) => {
  const schema: {
    ver: string;
    indexPage: Record<string, any>;
    components: IndexDeisgnSaveComponent[];
  } = {
    ver: 'V3',
    indexPage: {
      ...indexPageConfig,
    },
    components: [],
  };
  forEachComponents(componentList || [], schema.components);
  return schema;
};

/**
 *
 * @param list
 * @param res
 */
const forEachComponents = (list: DesignComponent[], res: IndexDeisgnSaveComponent[]) => {
  list.forEach((item) => {
    const component: IndexDeisgnSaveComponent = {
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

export const toIndexSchema = (data: {
  ver: string;
  indexPage: Record<string, any>;
  components: IndexDeisgnSaveComponent[];
}) => {
  const componentList: PageSchemaConfig[] = toRuntimeIndex(data.components);
  const pageConfig: Record<string, any> = data.indexPage;

  return {
    pageConfig,
    componentList,
  };
};

const toRuntimeIndex = (list: IndexDeisgnSaveComponent[]) => {
  const childrenGroup: Record<string, PageSchemaConfig[]> = {};
  const componentDic: Record<string, PageSchemaConfig> = {};

  list.forEach((item) => {
    childrenGroup[item.containerId] = childrenGroup[item.containerId] || [];
    const component: PageSchemaConfig = {
      id: item.id,
      type: item.runtimeType,
      slot: item.groupId,
      config: {},
    };

    if (item.config) {
      Object.keys(item.config).forEach((key) => {
        // @ts-ignore
        component.config[key] = item.config[key];
      });
    }
    childrenGroup[item.containerId].push(component);
    componentDic[item.id] = component;
  });

  Object.keys(childrenGroup).forEach((key) => {
    if (componentDic[key]) {
      componentDic[key].children = childrenGroup[key];
    }
  });

  return childrenGroup.indexPage || [];
};

export const toIndexDesignSchema = (
  data: Record<string, any>,
  componentsMap: Record<string, IndexDesignComponent>,
) => {
  let pageConfig: Record<string, any> = {};
  let componentList: DesignComponent[] = [];
  const componentDic: Record<string, DesignComponent> = {};
  if (data.ver === 'V3') {
    const schemaV3 = data as {
      ver: string;
      indexPage: Record<string, any>;
      components: IndexDeisgnSaveComponent[];
    };
    pageConfig = schemaV3.indexPage;

    const childrenGroup: Record<string, DesignComponent[]> = {};

    schemaV3.components.forEach((item) => {
      const designComponent = componentsMap[item.type];
      if (!designComponent) {
        return;
      }

      childrenGroup[item.containerId] = childrenGroup[item.containerId] || [];

      const component: DesignComponent = {
        id: item.id,
        name: item.name,
        type: item.type,
        dragType: designComponent.dragType || 'component',
        componentName: designComponent.componentName || '',
        runtimeType: designComponent.runtimeType,
        groupId: item.groupId,
        config: item.config,
        isInput: false,
        containerId: item.containerId,
        level: item.level,
      };
      componentDic[component.id] = component;

      childrenGroup[item.containerId].push(component);

      if (component.dragType === 'container') {
        component.children = [];
      }
    });

    Object.keys(childrenGroup).forEach((key) => {
      if (componentDic[key]) {
        componentDic[key].children = childrenGroup[key];
      }
    });

    componentList = childrenGroup.indexPage || [];
  }

  return {
    pageConfig,
    componentList,
    componentDic,
  };
};
