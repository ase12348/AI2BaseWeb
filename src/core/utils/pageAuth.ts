import type { AppPageConfig, ButtonType, ColumnType } from '/#/page';
import type { FormAuthConfigType, FormAuthSchemaConfig } from '/#/form';

import { t } from '@/core/locales/setupI18n';

let pageTitle = '';

const getButtons = (data: ButtonType[], pid: string, groupId?: string) => {
  const list: Record<string, any>[] = [];
  data.forEach((item) => {
    if (item.prop) {
      list.push({ value: groupId ? `${groupId}.${item.prop}` : item.prop, label: item.label, pid });
      if (item.children) {
        list.push(...getButtons(item.children, item.prop, groupId));
      }
    }
  });

  return list;
};

const getColumns = (data: ColumnType[], pid: string, groupId?: string) => {
  const list: Record<string, any>[] = [];
  data.forEach((item) => {
    if (item.prop) {
      list.push({ value: groupId ? `${groupId}.${item.prop}` : item.prop, label: item.label, pid });
      if (item.children) {
        list.push(...getColumns(item.children, item.prop, groupId));
      }
    }
  });

  return list;
};

const getForms = (data: FormAuthConfigType[]) => {
  const list: Record<string, any>[] = [];

  if (data.length == 1) {
    list.push(...getFormAuthSchema(data[0].schema, '0', ''));
  } else {
    data.forEach((item) => {
      if (item.schema.length > 0) {
        const formItem = {
          value: `jcode_f_${item.path.replace(/\//g, '_')}`,
          name: item.name || t('表单'),
          pid: '0',
        };
        list.push(formItem);
        list.push(...getFormAuthSchema(item.schema, formItem.value, formItem.value));
      }
    });
  }
  return list;
};
const getFormItemId = (item: FormAuthSchemaConfig, formId: string, parentTableId?: string) => {
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

  if (!id) {
    console.warn(item, `${t('页面')}【${pageTitle}】${t('没有设置')}id`);
  }

  if (formId && id?.indexOf(formId) === -1) {
    id = `${formId}.${id}`;
  }

  return id || '';
};
const getFormAuthSchema = (schema: FormAuthSchemaConfig[], pid: string, formId: string) => {
  const list: Record<string, any>[] = [];

  schema.forEach((item) => {
    if (['collapse', 'tabs'].includes(item.type || '')) {
      const authPItem = {
        value: `${getFormItemId(item, formId)}`,
        name: `${item.name || item.config?.label || (item.type === 'collapse' ? t('折叠面板') : t('选项卡'))}`,
        pid,
        formId,
      };
      list.push(authPItem);
      if (item.config?.groups) {
        item.config?.groups.forEach((groupItem) => {
          const authItem = {
            value: `${getFormItemId(item, formId)}_${groupItem.i}`,
            name: groupItem.label,
            pid: authPItem.value,
            formId,
          };
          list.push(authItem);
          // list.push(...getFormAuthSchema(cItem.children || [], authItem.value, formId));
        });

        item.children?.forEach((cItem) => {
          /*const authItem = {
            value: `${getFormItemId(cItem, formId)}`,
            name: cItem.name || cItem.config?.label || `${getFormItemId(cItem, formId)}`,
            pid: `${getFormItemId(item, formId)}_${cItem.slot}`,
            formId,
          };
          list.push(authItem);*/
          list.push(
            ...getFormAuthSchema([cItem], `${getFormItemId(item, formId)}_${cItem.slot}`, formId),
          );
        });
      } else {
        item.children?.forEach((cItem, index) => {
          const authItem = {
            value: `${getFormItemId(item, formId)}_${index}`,
            name: cItem.name || cItem.config?.label || `${t('选项卡')}${index}`,
            pid: authPItem.value,
            formId,
          };
          list.push(authItem);
          list.push(...getFormAuthSchema(cItem.children || [], authItem.value, formId));
        });
      }
    } else if (item.type === 'gridtable') {
      const authItem = {
        value: `${getFormItemId(item, formId)}`,
        name: `${item.name || item.config?.label || t('表格')}`,
        pid,
        formId,
        isGridtable: true,
      };
      list.push(authItem);

      const authAdd = {
        value: `${getFormItemId(item, formId)}_add`,
        name: `【${t('按钮')}】${t('新增')}`,
        pid: authItem.value,
        formId,
      };
      list.push(authAdd);
      const authDelete = {
        value: `${getFormItemId(item, formId)}_delete`,
        name: `【${t('按钮')}】${t('删除')}`,
        pid: authItem.value,
        formId,
      };
      list.push(authDelete);

      item.children?.forEach((cItem) => {
        if (cItem.type === 'gridtable') {
          list.push(...getFormAuthSchema([cItem], authItem.value, formId));
        } else if (!cItem.config?.isPkey) {
          const cauthItem = {
            value: `${getFormItemId(cItem, formId, authItem.value)}`,
            name: `【列】${
              cItem.name || cItem.config?.label || getFormItemId(cItem, formId, authItem.value)
            }`,
            pid: authItem.value,
            formId,
          };
          list.push(cauthItem);
        }
      });
    } else if (!item.config?.isPkey) {
      const authItem = {
        value: getFormItemId(item, formId),
        name: item.name || item.config?.label || getFormItemId(item, formId),
        pid,
        formId,
      };

      list.push(authItem);
      list.push(...getFormAuthSchema(item.children || [], authItem.value, formId));
    }
  });
  return list;
};

export { getFormAuthSchema };

// 获取页面权限注册数据
export default function getPageAuthData(data: AppPageConfig) {
  pageTitle = data.title;
  // 按钮
  const buttons: Record<string, any>[] = [];
  // @ts-ignore
  if (data.buttons && data.buttons.length > 0 && data.buttons[0].buttonList) {
    (data.buttons || []).forEach((item, index) => {
      const groupId = item.id || `jcode_c_${index}`;
      buttons.push({ value: groupId, label: item.label || t('按钮'), pid: '0' });
      buttons.push(...getButtons(item.buttonList || [], groupId, item.id));
    });
  } else {
    buttons.push(...getButtons(data.buttons || [], '0'));
  }

  // 列表
  const columns: Record<string, any>[] = [];
  if (data.columns && data.columns.length == 1) {
    columns.push(...getColumns(data.columns[0].list || [], '0'));
  } else {
    (data.columns || []).forEach((item, index) => {
      const groupId = item.id || `jcode_c_${index}`;
      columns.push({ value: groupId, label: item.label || t('列表'), pid: '0' });
      columns.push(...getColumns(item.list || [], groupId, item.id));
    });
  }

  // 表单
  const forms = getForms(data.forms || []);

  // 注册流程系统表单
  const wfForms: any[] = [];
  data.forms?.forEach((item) => {
    if (item.isWorkflow) {
      wfForms.push({
        form: item.path.replace(/\//g, '_'),
        title: data.title,
      });
    }
  });

  // 子页面
  const childPages = data.childPages;

  return { buttons, columns, forms, wfForms, childPages };
}
