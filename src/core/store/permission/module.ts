import type { ButtonType, ColumnType } from '/#/page';
import { defineStore } from 'pinia';
import { store } from '/@/core/store';

import { defHttp } from '/@/core/utils/http/axios';

const urlPrefix = `permission/module`;
export const api = {
  get: (id: string, name: string) => {
    return defHttp.get({
      url: `${urlPrefix}/${id}`,
      params: { name },
    });
  },
};

interface TypeState {
  pageAuth: Record<string, any>;
  loadState: Record<string, boolean>;
  notAuth: Record<string, boolean>;
}

const filterAuthButtonsOrColumns = (
  columns: ColumnType[] | ButtonType[],
  authButtonsOrColumns: string[],
  pageName: string,
  groupId?: string,
): ColumnType[] => {
  const list: ColumnType[] = [];
  columns.forEach((col) => {
    let id = groupId ? `${groupId}.${col.i || col.prop}` : col.i || col.prop;
    id = pageName ? `${pageName}.${id}` : id;

    if (authButtonsOrColumns.includes(id)) {
      const item: Record<string, any> = {};

      Object.keys(col).forEach((key) => {
        if (key === 'children') {
          if (col.children) {
            item.children = filterAuthButtonsOrColumns(
              col.children,
              authButtonsOrColumns,
              pageName,
              groupId,
            );
          }
        } else {
          item[key] = col[key];
        }
      });

      list.push(item as ColumnType);
    }
  });
  return list;
};

export const usePermissionModuleStore = defineStore('permission-module', {
  state: (): TypeState => ({
    pageAuth: {},
    loadState: {},
    notAuth: {},
  }),
  getters: {},
  actions: {
    getLoadedState(moduleCode: string) {
      return this.pageAuth[moduleCode] || this.notAuth[moduleCode];
    },
    async load(moduleCode: string, moduleId: string, moduleName: string) {
      if (!moduleId) {
        return;
      }
      if (!this.loadState[moduleCode]) {
        this.loadState[moduleCode] = true;
        const res = await api.get(moduleId, moduleName);
        // console.log(moduleCode, moduleId, moduleName, res, '加载权限');
        if (res) {
          const formMap: Record<string, string> = {};
          res.forms.forEach((item: string) => {
            const idList = item.split(',');
            const id = idList[0];
            const type = idList[1];
            formMap[id] = type;
          });
          res.forms = formMap;
          this.pageAuth[moduleCode] = res;
        } else {
          this.loadState[moduleCode] = false;
        }
      }
    },
    clear() {
      this.notAuth = {};
      this.pageAuth = {};
      this.loadState = {};
    },
    setNotAuth(moduleCode: string, moduleId: string, moduleName: string) {
      this.notAuth[moduleCode] = true;
      if (!moduleId) {
        return;
      }
      api.get(moduleId, moduleName);
    },
    filterButtons(buttons: ButtonType[], moduleCode: string, pageName: string, groupId?: string) {
      if (this.notAuth[moduleCode]) {
        return buttons;
      }

      const authButton = this.pageAuth[moduleCode]?.buttons || [];
      const isAll = authButton.findIndex((t) => t.indexOf('jcode_auth_all') != -1) != -1; // 是否有全部权限
      if (isAll) {
        return buttons;
      }

      /*return buttons.filter((t) =>
        authButton.includes(pageName ? `${pageName}.${t.prop}` : t.prop),
      );*/
      return filterAuthButtonsOrColumns(buttons, authButton, pageName, groupId);
    },
    filterColumns(columns: ColumnType[], moduleCode: string, pageName: string, groupId?: string) {
      if (this.notAuth[moduleCode]) {
        return columns;
      }

      const authColumns = this.pageAuth[moduleCode]?.columns || [];
      const isAll = authColumns.findIndex((t) => t.indexOf('jcode_auth_all') != -1) != -1; // 是否有全部权限
      if (isAll) {
        return columns;
      }

      return filterAuthButtonsOrColumns(columns, authColumns, pageName, groupId);
    },
    hasFormLook(
      formId: string,
      moduleCode: string,
      pageName: string,
      groupId?: string,
      getWFAuthFields?: any,
    ) {
      let id = groupId ? `${groupId}.${formId}` : formId;
      id = pageName ? `${pageName}.${id}` : id;

      if (getWFAuthFields) {
        const authFields = getWFAuthFields(groupId);
        const authField = authFields.find((t) => t.prop == id);

        // 走流程的权限
        return authField?.isLook;
      }

      // console.log(pageName, 'this.notAuth[moduleCode]');
      if (this.notAuth[moduleCode]) {
        return true;
      }

      const authForms = this.pageAuth[moduleCode].forms;
      if (authForms['jcode_auth_all']) {
        return true;
      }

      // console.log(authForms, authForms[id], formId, moduleCode, pageName, groupId, id, 'authForms');
      return !!authForms[id];
    },
    hasFormEdit(
      formId: string,
      moduleCode: string,
      pageName: string,
      groupId?: string,
      getWFAuthFields?: any,
    ) {
      let id = groupId ? `${groupId}.${formId}` : formId;
      id = pageName ? `${pageName}.${id}` : id;
      if (getWFAuthFields) {
        const authFields = getWFAuthFields(groupId);
        const authField = authFields.find((t) => t.prop == id);

        // 走流程的权限
        return authField?.isEdit;
      }

      if (this.notAuth[moduleCode]) {
        return true;
      }

      const authForms = this.pageAuth[moduleCode].forms;
      if (authForms['jcode_auth_all']) {
        return true;
      }

      return authForms[id] == '2';
    },
    getForms(moduleCode: string) {
      if (this.notAuth[moduleCode]) {
        return undefined;
      }
      const authForms = this.pageAuth[moduleCode].forms;
      if (authForms['jcode_auth_all']) {
        return undefined;
      }
      const res: Record<string, any>[] = [];
      Object.keys(authForms).forEach((key) => {
        const keys = key.split('|');
        if (keys.length == 2) {
          res.push({ prop: keys[1], formId: keys[0], isEdit: authForms[key] == '2', isLook: true });
        } else {
          res.push({ prop: key, isEdit: authForms[key] == '2', isLook: true });
        }
      });

      return res;
    },
  },
});

// Need to be used outside the setup
export function usePermissionModuleStoreWithOut() {
  return usePermissionModuleStore(store);
}
