import type { FormDesignComponent } from '../../formDesign/interface';
import type { SchemaConfig } from '../../cSchemaForm/interface';
import type { DesignComponent } from '../interface';
import { ref, reactive, provide, computed, nextTick } from 'vue';
import { buildShortUUID, deepClone, clearData } from '../../utils/method';
import { emitEvent } from '../eventBus';

export const useDesign = (
  dragContainer: any,
  configRef: any,
  top: DesignComponent,
  componentInit: any,
  componentConfigInit: any,
  componentConfigs: Record<string, SchemaConfig[]>,
  componentsMap: Record<string, FormDesignComponent>,
  containerAddComponent: any,
) => {
  // 提供注入方法
  const activedComponent = ref<any>();
  const schemaComponentDic = reactive<Record<string, DesignComponent>>({});
  const componentList = computed(() => {
    const res: DesignComponent[] = [];
    Object.keys(schemaComponentDic).forEach((key) => {
      const component = schemaComponentDic[key];
      if (component.dragType === 'component' && component.type !== 'pkey') {
        res.push(component);
      }
    });
    return res;
  });

  const myComponentConfigInit = (type: string) => {
    if (componentConfigInit) {
      return componentConfigInit(type, {
        componentDic: schemaComponentDic,
        components: componentList.value,
        configData: activedComponent.value.config,
      });
    }
    return {};
  };

  const selectComponent = (id: string, tmpComponent?: DesignComponent) => {
    if (activedComponent.value?.id === id) return;

    const component = schemaComponentDic[id] || tmpComponent;
    if (component) {
      activedComponent.value = component;
    } else if (id === top.id) {
      activedComponent.value = top;
    } else {
      activedComponent.value = null;
    }

    // 设置配置表单
    if (activedComponent.value) {
      const configFormSchema = componentConfigs[activedComponent.value.type];

      if (configFormSchema) {
        configRef.value.setInit(configFormSchema, activedComponent.value.config);

        myComponentConfigInit(activedComponent.value.type);
      } else {
        configRef.value.setInit([]);
      }
    } else {
      configRef.value.setInit([]);
    }

    if (tmpComponent) {
      emitEvent('dragClick', {
        id: tmpComponent.id,
      });
    }
  };

  const getDesignLocals = () => dragContainer.value.$el.getBoundingClientRect();

  const getComponent = (id: string) => {
    if (id === top.id) {
      return top;
    }
    return schemaComponentDic[id] || {};
  };

  const getParentComponents = (containerId: string): Array<{ id: string; name: string }> => {
    const res: Array<{ id: string; name: string }> = [];
    if (containerId === top.id) {
      res.push({ id: containerId, name: top.name });
    } else {
      const component = schemaComponentDic[containerId];

      if (component) {
        res.push({ id: containerId, name: component.name });
        const _res = getParentComponents(component.containerId);
        res.push(..._res);
      }
    }

    return res;
  };

  const isMyChildComponent = (parentId: string, id: string): boolean => {
    const my = schemaComponentDic[id];
    if (my === undefined) {
      return false;
    }
    const myParentId = my.containerId;

    if (parentId === myParentId) {
      return true;
    }

    if (myParentId === top.id) {
      return false;
    }

    return isMyChildComponent(parentId, myParentId);
  };

  const myComponentInit = (type: string) => {
    if (componentInit) {
      return componentInit(type) || {};
    }
    return {};
  };

  // 容器添加组件
  const myContainerAddComponent = (
    containerId: string,
    groupId: string,
    configData: Record<string, any>,
    isContainerIdChange: boolean,
  ) => {
    if (containerAddComponent) {
      const container = getComponent(containerId);
      return containerAddComponent(
        configData.componentType,
        { container, groupId, configData },
        isContainerIdChange,
      );
    }
    return false;
  };

  const addComponent = (
    { name, type, dragType, isInput, componentName, runtimeType }: FormDesignComponent,
    containerId: string,
    index: number,
    groupId: string,
    noSelect = false,
  ) => {
    const config = myComponentInit(type);
    config.id = buildShortUUID();
    config.span = 24;
    config.componentType = type;
    // 子表组件过滤
    if (isNotAddConponent(containerId, config.componentType)) {
      return;
    }

    myContainerAddComponent(containerId, groupId, config, true); // 组件变化容器调用
    const obj: DesignComponent = {
      id: config.id,
      name,
      type,
      runtimeType,
      componentName: componentName || '',
      dragType: dragType || 'component',
      containerId,
      isInput: !!isInput,
      level: schemaComponentDic[containerId] ? schemaComponentDic[containerId].level + 1 : 1,
      config,
      isNewAdd: !noSelect,
      groupId,
    };
    if (obj.dragType === 'container') {
      obj.children = [];
    }
    schemaComponentDic[obj.id] = obj;
    getComponent(containerId).children?.splice(index, 0, obj);

    return obj;
  };
  // 判断是否添加，针对容器是子表的时候
  const isNotAddConponent = (containerId: string, configType: string) => {
    const container = getComponent(containerId);
    if (
      container.config.componentType === 'gridtable' &&
      [
        // 'gridtable',
        'divider',
        'label',
        'text',
        'textEditor',
        'viewTable',
        'card',
        'collapse',
        'tabs',
        'qrcode',
        'barcode',
        'tableLayout',
      ].includes(configType)
    ) {
      return true;
    }
    return false;
  };

  const removeComponentFromContainer = (containerId: string, id: string, needSelect = false) => {
    let select = null;
    const childComponents = getComponent(containerId).children;
    const myIndex = childComponents?.findIndex((t) => t.id === id) || 0;

    if (needSelect && childComponents && childComponents.length > 1) {
      let selectIndex = myIndex + 1;
      if (myIndex > 0) {
        selectIndex = myIndex - 1;
      }
      select = childComponents[selectIndex];
    }

    childComponents?.splice(myIndex, 1);

    return select?.id;
  };

  const addComponentToContainer = (
    component: DesignComponent,
    containerId: string,
    index: number,
    groupId: string,
  ) => {
    const childComponents = getComponent(containerId).children;
    const isContainerIdChange = component.containerId !== containerId;
    component.containerId = containerId;
    component.groupId = groupId;
    childComponents?.splice(index, 0, component);

    const isSubTableChange = myContainerAddComponent(
      containerId,
      groupId,
      component.config,
      isContainerIdChange,
    ); // 组件变化容器调用
    if (isSubTableChange) {
      clearSelect();
      selectComponent(component.id);
    }
  };

  const deleteComponent = (id: string) => {
    let selectId = '';
    const component = getComponent(id);
    if (component) {
      if (component.children && component.children.length > 0) {
        component.children.forEach((child) => {
          deleteComponent(child.id);
        });
      }
      selectId = removeComponentFromContainer(component.containerId, id, true) || '';
      delete schemaComponentDic[id];
    }

    if (activedComponent.value && activedComponent.value.id === id) {
      activedComponent.value = null;
      configRef.value.setInit([]);
    }

    return selectId;
  };
  const deleteChildrens = (id: string, groupIds: string[] = []) => {
    const component = getComponent(id);
    if (component) {
      if (component.children && component.children.length > 0) {
        const childId: string[] = [];
        component.children.forEach((child) => {
          if (child.groupId && groupIds.includes(child.groupId)) {
            childId.push(child.id);
          }
        });
        childId.forEach((id) => {
          deleteComponent(id);
          delete schemaComponentDic[id];
        });
      }
    }
  };

  const deleteChildren = (id: string, groupId: string) => {
    const component = getComponent(id);
    if (component) {
      if (component.children && component.children.length > 0) {
        component.children.forEach((child) => {
          if (child.groupId === groupId) {
            deleteComponent(child.id);
          }
        });
      }
      delete schemaComponentDic[id];
    }
  };

  const copyComponent = (id: string) => {
    const component = deepClone(getComponent(id));
    component.id = buildShortUUID();
    component.config.id = component.id;
    schemaComponentDic[component.id] = component;
    const childComponents = getComponent(component.containerId).children;
    const myIndex = childComponents?.findIndex((t) => t.id === id) || 0;
    childComponents?.splice(myIndex + 1, 0, component);
  };

  const clearComponents = () => {
    top.children = [];
    clearData(schemaComponentDic);
    if (activedComponent.value) {
      emitEvent('dragClick', {
        id: '',
      });
      activedComponent.value = null;
      configRef.value.setInit([]);
    }
  };

  const clearSelect = () => {
    if (activedComponent.value) {
      emitEvent('dragClick', {
        id: '',
      });
      activedComponent.value = null;
      configRef.value.setInit([]);
    }
  };

  // 改变组件
  const changeComponent = (type: string) => {
    const component = activedComponent.value;
    const childComponents = getComponent(component.containerId).children;
    const myIndex = childComponents?.findIndex((t) => t.id === component.id) || 0;

    deleteComponent(component.id);

    nextTick(() => {
      const newComponent = componentsMap[type];
      const config = myComponentInit(type);
      config.id = component.id;
      config.span = component.config.span;
      config.componentType = type;
      config.table = component.config.table;
      config.field = component.config.field;
      if (component.config.isSubTable) {
        config.isSubTable = component.config.isSubTable;
      }
      const obj: DesignComponent = {
        id: config.id,
        name: newComponent.name,
        type,
        runtimeType: newComponent.runtimeType,
        componentName: newComponent.componentName || '',
        dragType: component.dragType,
        groupId: component.groupId,
        containerId: component.containerId,
        isInput: component.isInput,
        level: component.level,
        config,
        isNewAdd: true,
      };
      schemaComponentDic[obj.id] = obj;

      childComponents?.splice(myIndex, 0, obj);
    });
  };

  const addComponentByTable = (component: any) => {
    emitEvent('dragAddByClick', component);
  };

  provide('jcode-darg-design-provide', {
    activedComponent,
    getDesignLocals,
    getComponent,
    getParentComponents,
    isMyChildComponent,
    selectComponent,
    addComponent,
    deleteComponent,
    copyComponent,
    removeComponentFromContainer,
    addComponentToContainer,
    top,

    deleteChildren,
    deleteChildrens,
  });

  return {
    activedComponent,
    clearComponents,
    changeComponent,
    schemaComponentDic,
    clearSelect,
    addComponent,
    addComponentByTable,
    designComponentList: componentList,
  };
};
