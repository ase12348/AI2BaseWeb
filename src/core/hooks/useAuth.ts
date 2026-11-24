import type { AppPageConfig, ColumnType } from '/#/page';
import type { FormAuthSchemaConfig, FormSchemaConfig } from '/#/form';
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import { existFiled } from '@/core/utils/validator';
import { usePermissionModuleStore } from '/@/core/store/permission/module';
import { getRouteId } from '/@/core/utils';
import { deepClone } from '/@/core/utils/jcode';

import { t } from '@/core/locales/setupI18n';

export function useAuth(
  page: AppPageConfig,
  data?: {
    buttonClick?: Record<string, any>;
    buttonConfig?: Record<string, any>;
    formConfigs?: Record<string, FormSchemaConfig>;
  },
) {
  const { getPageName, getWFAuthFields } = inject('jcode_auth_page_provide', {
    getPageName: () => '' as string,
    getWFAuthFields: undefined,
  });

  const route = useRoute();
  const moduleCode = getRouteId(route);
  const routeName = (route.name || '') as string;
  let pageName = getPageName();
  if (pageName && pageName.indexOf(routeName.replace('_index', '')) == -1) {
    pageName = `jcode_p_${pageName}`;
  } else {
    pageName = '';
  }

  const permissionModuleStore = usePermissionModuleStore();

  const { buttonClick, formConfigs, buttonConfig } = data || {};

  const forEachColumnChild = (columns: ColumnType[], configs: Record<string, any>) => {
    columns?.forEach((col) => {
      const config = configs[col.prop];
      if (config) {
        col.config = col.config || {};
        Object.keys(config).forEach((key) => {
          // @ts-ignore
          col.config[key] = config[key];
        });
      }

      if (col.children) {
        forEachColumnChild(col.children, configs);
      }
    });
  };

  const addClickEvent = (list: Record<string, any>[], buttonClick?: Record<string, any>) => {
    if (buttonClick != undefined) {
      list?.forEach((item) => {
        item.click = buttonClick[item.prop || ''];
        if (item.children) {
          addClickEvent(item.children, buttonClick);
        }
      });
    }
  };
  const getButtons = (classify?: string, id?: string) => {
    if (!page.buttons || page.buttons.length == 0) return [];
    let buttons;

    // @ts-ignore
    if (page.buttons[0].buttonList) {
      if (id) {
        // @ts-ignore
        buttons = page.buttons.find((item) => item.id == id)?.buttonList || [];
      } else {
        // @ts-ignore
        buttons = page.buttons.find((item) => !item.id)?.buttonList || [];
      }
    } else {
      buttons = page.buttons;
    }

    if (classify) {
      buttons = buttons.filter((item) => item.classify === classify) || [];
    } else {
      buttons = buttons.filter((item) => !item.classify) || [];
    }

    // 注册点击事件
    addClickEvent(buttons || [], buttonClick);

    if (buttonConfig != undefined) {
      buttons?.forEach((item) => {
        Object.keys(buttonConfig[item.prop || ''] || {}).forEach((key) => {
          item[key] = buttonConfig[item.prop || ''][key];
        });
      });
    }

    return permissionModuleStore.filterButtons(deepClone(buttons), moduleCode, pageName, id);
  };

  const getColumns = (columnsConfig?: Record<string, any>, id?: string) => {
    let columns: ColumnType[];
    if (id) {
      columns = page.columns?.find((item) => item.id === id)?.list || [];
    } else {
      columns = page.columns?.find((item) => !item.id)?.list || [];
    }
    columns = permissionModuleStore.filterColumns(columns, moduleCode, pageName, id);
    if (columnsConfig) {
      forEachColumnChild(columns, columnsConfig);
    }
    return columns;
  };

  // 表单
  const getId = (item: FormAuthSchemaConfig, parentTableId: string) => {
    let id = item.id;
    if (!id && item.table && item.field) {
      id = `${item.table}.${item.field}`;
    }
    if (!id && item.table) {
      id = item.table;
    }
    if (!id && item.field) {
      id = item.field;
    }
    if (!item.id && parentTableId) {
      id = `${parentTableId}.${id}`;
    }

    return id || '';
  };

  const setFormConfig = (
    authList: FormAuthSchemaConfig[],
    formSchema: FormSchemaConfig[],
    parentTableId = '',
    formId?: string,
  ) => {
    if (!formConfigs) {
      return;
    }

    authList.forEach((item) => {
      const id = getId(item, parentTableId);

      const configItem = formConfigs[id || ''];
      const onlyRule = configItem?.rule?.find((rule) => rule.type === 'only');

      // 设置字段不能重复
      if (onlyRule) {
        onlyRule.trigger = 'null';
        onlyRule.lr_field = onlyRule.lr_field || item.field;
        onlyRule.lr_existFiled = existFiled;
      }

      const point: FormSchemaConfig = {
        id,
        type: parentTableId
          ? configItem?.type || item.type
          : configItem?.type || item.type || 'input',
        rule: configItem?.rule,
        slot: item.slot,
        //children: [],
      };

      // 处理系统表单校验权限
      if (getWFAuthFields) {
        // @ts-ignore
        const authFields = getWFAuthFields(formId);
        const wfid = formId ? `${formId}.${id}` : id;
        const authField = authFields.find((t) => t.prop == wfid);
        if (authField && authField.required && point.rule?.find((t) => t.required) == undefined) {
          point.rule = point.rule || [];
          point.rule.push({ required: true, message: t('请输入') });
        }
      }

      if (
        !permissionModuleStore.hasFormLook(id, moduleCode, pageName, formId, getWFAuthFields) &&
        !['collapse', 'tabs'].includes(point.type || '')
      ) {
        return;
      }

      point.config = item.config || {};

      Object.keys(configItem?.config || {}).forEach((key) => {
        // @ts-ignore
        point.config[key] = configItem?.config[key];
      });

      point.config.field = item.field;
      point.config.table = item.table;

      if (point.config && !point.config?.label) {
        point.config.label = item.name;
      }

      if (!permissionModuleStore.hasFormEdit(id, moduleCode, pageName, formId, getWFAuthFields)) {
        point.config.readonly = true;
      }

      if (item.children && item.children.length > 0) {
        point.children = [];
        const children: FormAuthSchemaConfig[] = [];

        if (['collapse', 'tabs'].includes(point.type || '')) {
          if (!point.config?.groups) {
            point.config.groups = [];

            item.children.forEach((childrenItem, index) => {
              if (
                !permissionModuleStore.hasFormLook(
                  `${id}_${index}`,
                  moduleCode,
                  pageName,
                  formId,
                  getWFAuthFields,
                )
              ) {
                return;
              }
              point.config?.groups.push({
                i: `c${index}`,
                label: childrenItem.name,
                span: childrenItem.config?.span,
                labelWidth: childrenItem.config?.labelWidth,
              });
              childrenItem.children?.forEach((groupItem) => {
                groupItem.slot = `c${index}`;
                children.push(groupItem);
              });
            });
            point.config.defaultValue = 'c0';
          }
        } else {
          children.push(...item.children);
        }

        setFormConfig(
          children,
          point.children,
          ['gridtable', 'inputRows', 'inputCards'].includes(point.type || '') ? id : '',
          formId,
        );

        if (configItem?.type != 'input' && point.type == 'input') {
          delete point.type;
        }
      }

      if (['gridtable'].includes(point.type || '')) {
        if (!point.children || point.children.length <= 0) {
          return;
        }

        point.config.isAddBtn =
          point.config.isAddBtn &&
          permissionModuleStore.hasFormLook(
            `${id}_add`,
            moduleCode,
            pageName,
            formId,
            getWFAuthFields,
          );
        point.config.isRemoveBtn =
          point.config.isRemoveBtn &&
          permissionModuleStore.hasFormLook(
            `${id}_delete`,
            moduleCode,
            pageName,
            formId,
            getWFAuthFields,
          );
      }

      formSchema.push(point);
    });
  };

  // 获取页面配置文表单模版
  const getAuthFormSchema = (path?: string) => {
    let formAuthSchema: FormAuthSchemaConfig[];
    if (path) {
      formAuthSchema = page.forms?.find((t) => t.path === path)?.schema || [];
    } else {
      formAuthSchema = page.forms?.find((t) => t.path == 'form')?.schema || [];
    }

    return formAuthSchema;
  };

  const getFormSchema = (path?: string) => {
    if (!page.forms) {
      return [];
    }

    const formAuthSchema = getAuthFormSchema(path);
    const formSchema: FormSchemaConfig[] = [];
    setFormConfig(
      formAuthSchema,
      formSchema,
      '',
      page.forms.length <= 1 ? '' : `jcode_f_${(path || 'form').replace(/\//g, '_')}`,
    );

    return formSchema;
  };

  return { getButtons, getColumns, getFormSchema };
}

export function useCustmerAuth() {
  const route = useRoute();
  const moduleCode = getRouteId(route);
  const permissionModuleStore = usePermissionModuleStore();

  const filterAuths = (componentList: Record<string, any>[]) => {
    componentList.forEach((component: Record<string, any>) => {
      // 过滤按钮
      component.config.buttons = permissionModuleStore.filterButtons(
        component.config.buttons,
        moduleCode,
        '',
      );

      component.config.tableButtons = permissionModuleStore.filterButtons(
        component.config.tableButtons,
        moduleCode,
        '',
      );
      // 过滤表格列
      component.config.columns = permissionModuleStore.filterColumns(
        component.config.columns,
        moduleCode,
        '',
      );

      // 过滤表单字段
    });
  };

  return {
    filterAuths,
  };
}
