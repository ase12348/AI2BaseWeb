<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, h } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { useUserStore } from '/@/core/store/organization/user';
  import { api as apiUser } from '@/core/modules/organization/api/user';
  import { api } from '@/core/modules/permission/api/module';
  import { fullScreenLoading, deepClone, toTree } from '/@/core/utils/jcode';
  import { useMessage } from '@/core/hooks/useMessage';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();
  const userStore = useUserStore();
  const loginInfo = userStore.getLoginInfo;

  const userColumns = [
    { label: '姓名', prop: 'f_RealName', width: 88, isKeyword: true },
    { label: '账号', prop: 'f_Account', width: 88, isKeyword: true },
    {
      label: '类别',
      prop: 'f_UserType',
      width: 70,
      align: 'center',
      isFilter: true,
      config: { dataType: 'dataItem', dataCode: 'usercategory', filteProp: 'userType' },
    },
    {
      label: '公司',
      prop: 'f_CompanyId',
      width: 120,
      isFilter: true,
      config: {
        filteProp: 'companyId',
        dataType: 'company',
      },
    },
    {
      label: '部门',
      prop: 'f_DepartmentId',
      width: 140,
      isFilter: true,
      config: {
        dataType: 'department',
        filteProp: 'departmentId',
        upId: 'f_CompanyId',
      },
    },
  ];

  const selectRow = ref<Record<string, any>>();

  const paramData = reactive({ tabs2: 'c0' });
  const panelTitle = computed(() => {
    let res = '';
    res = t('用户');
    if (selectRow.value) {
      res += '-' + selectRow.value.f_Account + '-' + selectRow.value.f_RealName;
    }
    return res;
  });
  const { getAllUsedModules, getMyModules, getAllModuleDic } = useMenu(); //getAllModuleList,

  const selectObjId = computed(() => {
    if (selectRow.value) {
      return selectRow.value.f_UserId;
    }
    return '';
  });

  // 我有权限的模块数据
  const moduleDataList = computed(() => {
    if (!selectRow.value) {
      return [];
    }
    return getMyModules.value;
  });

  // 模块数据加载
  let notAuthList: string[] = [];
  const moduleCheckedList = ref<string[]>([]); // 获取数据
  const moduleCheckedListBySetting = ref<string[]>([]); // 当前设置数据

  const loadModuleAuthorizeData = async (id) => {
    fullScreenLoading(true);
    const { settingList } = await api.getList(id, 10, '0');

    if (!loginInfo?.isAdmin) {
      const myModules = loginInfo?.moduleAuthIds || [];
      notAuthList = settingList
        .filter(
          (t) =>
            getAllUsedModules.value.findIndex((t2) => t2.f_ModuleId == t.f_ItemId) > -1 &&
            !myModules.includes(t.f_ItemId),
        )
        .map((t) => t.f_ItemId);
    } else {
      notAuthList = [];
    }

    moduleCheckedList.value = settingList
      .filter((t) => getMyModules.value.findIndex((t2) => t2.f_ModuleId == t.f_ItemId) != -1)
      .map((t) => t.f_ItemId);
    moduleCheckedListBySetting.value = moduleCheckedList.value;

    const moduleChecked = moduleCheckedList.value.filter(
      (t) => getMyModules.value.findIndex((t2) => t2.f_ParentId == t) == -1,
    );

    getRef('moduleTree').setCheck(moduleChecked);

    clearSelect();

    fullScreenLoading(false);
  };
  const cancelModuleCheck = () => {
    moduleCheckedListBySetting.value = moduleCheckedList.value;
    const moduleChecked = moduleCheckedList.value.filter(
      (t) => getMyModules.value.findIndex((t2) => t2.f_ParentId == t) == -1,
    );
    getRef('moduleTree').setCheck(moduleChecked);
  };
  const saveModuleCheck = async () => {
    if (!selectObjId.value) {
      return;
    }
    fullScreenLoading(true);
    const ids: string[] = [];
    ids.push(...moduleCheckedListBySetting.value);
    ids.push(...notAuthList);
    const data = {
      ids,
      objectType: 2,
      itemType: 10,
      parentId: '0',
    };
    const res = await api.save(selectObjId.value, data);
    if (res) {
      success(`${t('保存成功')}!`);
      moduleCheckedList.value = moduleCheckedListBySetting.value;

      clearSelect();
    }
    fullScreenLoading(false);
  };

  // 按钮
  const buttonModuleId = ref('');
  const myButtonList = ref<any[]>([]);
  const buttonCheckedList = ref<string[]>([]);
  const buttonCheckedListBySetting = ref<string[]>([]); // 当前设置数据
  let buttonNoAuthList: string[] = [];

  const addChildPagesButtons = (
    url: string,
    pid: string,
    buttonList: any[],
    notPageList?: string[],
  ) => {
    // 处理子页面权限
    const childPages =
      // @ts-ignore
      (window.jcode_app_authdata[url] || {}).childPages || [];
    // @ts-ignore
    childPages.forEach(
      ({
        id,
        name,
        notButtons,
        notPages,
      }: {
        name: string;
        id: string;
        notButtons?: string[];
        notPages?: string[];
      }) => {
        if ((notPageList || []).includes(id)) {
          return;
        }

        const myUrl = `/${id.replace(/_/g, '/')}`.toLowerCase();
        let chidldButtonList = deepClone(
          // @ts-ignore
          (window.jcode_app_authdata[myUrl] || {}).buttons || [],
        );

        const value = `jcode_p_${id}`;
        notButtons = notButtons || [];
        chidldButtonList = chidldButtonList.filter((t) => !notButtons.includes(t.value));
        if (chidldButtonList.length > 0) {
          buttonList.push({ label: `${name}${t('页面')}`, value, pid });
          chidldButtonList.forEach((t) => {
            const myPid = t.pid == '0' ? value : `${value}.${t.pid}`;
            buttonList.push({ label: t.label, value: `${value}.${t.value}`, pid: myPid });
          });
        }
        addChildPagesButtons(myUrl, value, buttonList, notPages);
      },
    );
  };

  const loadButtonModuleAuthorizeData = async (moduleId) => {
    if (moduleId && selectObjId.value) {
      const module = getAllModuleDic.value[moduleId];
      const setData = await api.getList(selectObjId.value, 20, moduleId);

      buttonCheckedList.value = setData.settingList.map((t) => t.f_ItemId);
      let buttonList: Record<string, any>[] = [];

      if (['blankView', 'view'].includes(module.f_Target)) {
        // @ts-ignore
        buttonList = deepClone(
          // @ts-ignore
          (window.jcode_app_authdata[module.f_UrlAddress.toLowerCase()] || {}).buttons || [],
        );

        // 添加子页面按钮
        addChildPagesButtons(module.f_UrlAddress.toLowerCase(), '0', buttonList);

        // 从代码里获取注册按钮
      }

      if (!loginInfo?.isAdmin) {
        const myList = setData.myList || [];
        myButtonList.value = buttonList.filter((t) => myList.includes(t.value));
        buttonNoAuthList = buttonCheckedList.value.filter(
          (t) => buttonList.findIndex((t2) => t2.value == t) > -1 && !myList.includes(t),
        );
      } else {
        myButtonList.value = buttonList;
        buttonNoAuthList = [];
      }

      buttonCheckedList.value = buttonCheckedList.value.filter(
        (t) => myButtonList.value.findIndex((t2) => t2.value == t) != -1,
      );

      const buttonChecked = buttonCheckedList.value.filter(
        (t) => myButtonList.value.findIndex((t2) => t2.pid == t) == -1,
      );

      getRef('buttonTree').setCheck(buttonChecked);
    } else {
      myButtonList.value = [];
      buttonCheckedList.value = [];
      buttonNoAuthList = [];
    }

    buttonCheckedListBySetting.value = buttonCheckedList.value;
  };
  const cancelButtonCheck = () => {
    buttonCheckedListBySetting.value = buttonCheckedList.value;
    const buttonChecked = buttonCheckedList.value.filter(
      (t) => myButtonList.value.findIndex((t2) => t2.pid == t) == -1,
    );
    getRef('buttonTree').setCheck(buttonChecked);
  };
  const saveButtonCheck = async () => {
    if (!selectObjId.value) {
      return;
    }
    fullScreenLoading(true);
    const ids: string[] = [];
    ids.push(...buttonCheckedListBySetting.value);
    ids.push(...buttonNoAuthList);
    const data = {
      ids,
      objectType: 2,
      itemType: 20,
      parentId: buttonModuleId.value,
    };
    const res = await api.save(selectObjId.value, data);
    if (res) {
      success(`${t('保存成功')}!`);
      buttonCheckedList.value = buttonCheckedListBySetting.value;
    }
    fullScreenLoading(false);
  };

  // 列表
  const columnModuleId = ref('');
  const myColumnList = ref<any[]>([]);
  const columnCheckedList = ref<string[]>([]);
  const columnCheckedListBySetting = ref<string[]>([]); // 当前设置数据
  let columnNoAuthList: string[] = [];

  const addChildPagesColumns = (
    url: string,
    pid: string,
    columnList: any[],
    notPageList?: string[],
  ) => {
    // 处理子页面权限
    const childPages =
      // @ts-ignore
      (window.jcode_app_authdata[url] || {}).childPages || [];
    // @ts-ignore
    childPages.forEach(
      ({
        id,
        name,
        notColumns,
        notPages,
      }: {
        name: string;
        id: string;
        notColumns?: string[];
        notPages?: string[];
      }) => {
        if ((notPageList || []).includes(id)) {
          return;
        }

        const myUrl = `/${id.replace(/_/g, '/')}`.toLowerCase();
        let chidldColumnsList = deepClone(
          // @ts-ignore
          (window.jcode_app_authdata[myUrl] || {}).columns || [],
        );

        const value = `jcode_p_${id}`;
        notColumns = notColumns || [];
        chidldColumnsList = chidldColumnsList.filter((t) => !notColumns.includes(t.value));

        console.log(chidldColumnsList);
        if (chidldColumnsList.length > 0) {
          columnList.push({ label: `${name}${t('页面')}`, value, pid });
          chidldColumnsList.forEach((t) => {
            const myPid = t.pid == '0' ? value : `${value}.${t.pid}`;
            columnList.push({ label: t.label, value: `${value}.${t.value}`, pid: myPid });
          });
        }
        addChildPagesColumns(myUrl, value, columnList, notPages);
      },
    );
  };

  const loadColumnModuleAuthorizeData = async (moduleId) => {
    if (moduleId && selectObjId.value) {
      const module = getAllModuleDic.value[moduleId];
      const setData = await api.getList(selectObjId.value, 30, moduleId);

      columnCheckedList.value = setData.settingList.map((t) => t.f_ItemId);
      let columnList: Record<string, any>[] = [];

      if (['blankView', 'view'].includes(module.f_Target)) {
        // @ts-ignore
        columnList = deepClone(
          // @ts-ignore
          (window.jcode_app_authdata[module.f_UrlAddress.toLowerCase()] || {}).columns || [],
        );

        // 添加子页面列表
        addChildPagesColumns(module.f_UrlAddress.toLowerCase(), '0', columnList);

        // 从代码里获取注册按钮
      }

      if (!loginInfo?.isAdmin) {
        const myList = setData.myList || [];
        myColumnList.value = columnList.filter((t) => myList.includes(t.value));
        columnNoAuthList = columnCheckedList.value.filter(
          (t) => columnList.findIndex((t2) => t2.value == t) > -1 && !myList.includes(t),
        );
      } else {
        myColumnList.value = columnList;
        columnNoAuthList = [];
      }

      columnCheckedList.value = columnCheckedList.value.filter(
        (t) => myColumnList.value.findIndex((t2) => t2.value == t) != -1,
      );

      const columnChecked = columnCheckedList.value.filter(
        (t) => myColumnList.value.findIndex((t2) => t2.pid == t) == -1,
      );

      getRef('columnTree').setCheck(columnChecked);
    } else {
      myColumnList.value = [];
      columnCheckedList.value = [];
      columnNoAuthList = [];
    }
    columnCheckedListBySetting.value = columnCheckedList.value;
  };
  const cancelColumnCheck = () => {
    columnCheckedListBySetting.value = columnCheckedList.value;
    const columnChecked = columnCheckedList.value.filter(
      (t) => myColumnList.value.findIndex((t2) => t2.pid == t) == -1,
    );
    getRef('columnTree').setCheck(columnChecked);
  };
  const saveColumnCheck = async () => {
    if (!selectObjId.value) {
      return;
    }
    fullScreenLoading(true);
    const ids: string[] = [];
    ids.push(...columnCheckedListBySetting.value);
    ids.push(...columnNoAuthList);
    const data = {
      ids,
      objectType: 2,
      itemType: 30,
      parentId: columnModuleId.value,
    };
    const res = await api.save(selectObjId.value, data);
    if (res) {
      success(`${t('保存成功')}!`);
      columnCheckedList.value = columnCheckedListBySetting.value;
    }
    fullScreenLoading(false);
  };

  // 表单
  const formModuleId = ref('');
  const myFormList = ref<any[]>([]);
  const formCheckedList = ref<string[]>([]);
  const formCheckedListBySetting = ref<string[]>([]); // 当前设置数据
  let formNoAuthList: string[] = [];

  const addChildPagesForms = (
    url: string,
    pid: string,
    formList: any[],
    notPageList?: string[],
  ) => {
    // 处理子页面权限
    const childPages =
      // @ts-ignore
      (window.jcode_app_authdata[url] || {}).childPages || [];
    // @ts-ignore
    childPages.forEach(
      ({
        id,
        name,
        notForms,
        notPages,
      }: {
        name: string;
        id: string;
        notForms?: string[];
        notPages?: string[];
      }) => {
        if ((notPageList || []).includes(id)) {
          return;
        }

        const myUrl = `/${id.replace(/_/g, '/')}`.toLowerCase();
        let chidldFormList = deepClone(
          // @ts-ignore
          (window.jcode_app_authdata[myUrl] || {}).forms || [],
        );

        const value = `jcode_p_${id}`;
        notForms = notForms || [];
        chidldFormList = chidldFormList.filter((t) => !notForms.includes(t.value));

        if (chidldFormList.length > 0) {
          formList.push({ name: `${name}${t('页面')}`, value, pid });
          chidldFormList.forEach((t) => {
            const myPid = t.pid == '0' ? value : `${value}.${t.pid}`;
            formList.push({ name: t.name, value: `${value}.${t.value}`, pid: myPid });
          });
        }
        addChildPagesForms(myUrl, value, formList, notPages);
      },
    );
  };

  const loadFormModuleAuthorizeData = async (moduleId) => {
    if (moduleId && selectObjId.value) {
      const module = getAllModuleDic.value[moduleId];
      const setData = await api.getList(selectObjId.value, 40, moduleId);

      formCheckedList.value = setData.settingList.map((t) => `${t.f_ItemId},${t.f_Type}`);
      let formList: Record<string, any>[] = [];

      if (['blankView', 'view'].includes(module.f_Target)) {
        // @ts-ignore
        formList = deepClone(
          // @ts-ignore
          (window.jcode_app_authdata[module.f_UrlAddress.toLowerCase()] || {}).forms || [],
        );

        addChildPagesForms(module.f_UrlAddress.toLowerCase(), '0', formList);

        // getRef('columnTree').setCheck(columnChecked);
        // 从代码里获取注册按钮
      }

      const checkMap: Record<string, string> = {};
      formCheckedList.value.forEach((code: string) => {
        const codeList = code.split(',');
        checkMap[codeList[0].toLowerCase()] = codeList[1];
      });

      formList.forEach((item: any) => {
        if (checkMap[item.value.toLowerCase()]) {
          if (checkMap[item.value.toLowerCase()] == '2') {
            item.isLook = true;
            item.isEdit = true;
          } else if (checkMap[item.value.toLowerCase()] == '1') {
            item.isLook = true;
            item.isEdit = false;
          }
        } else {
          item.isLook = false;
          item.isEdit = false;
        }
      });

      if (!loginInfo?.isAdmin) {
        const myList = setData.myList || [];
        const myCheckMap: Record<string, string> = {};
        myList.forEach((code: string) => {
          const codeList = code.split(',');
          myCheckMap[codeList[0].toLowerCase()] = codeList[1];
        });
        const formListByFilter: any = [];
        formList.forEach((item: any) => {
          if (myCheckMap[item.value.toLowerCase()]) {
            if (myCheckMap[item.value.toLowerCase()] == '1') {
              item.notEdit = true;
            }
            formListByFilter.push(item);
          }
        });

        formCheckedList.value = formCheckedList.value.filter(
          (t) => formListByFilter.findIndex((t2) => t2.value == t.split(',')[0]) != -1,
        );

        myFormList.value = toTree(formListByFilter, 'value', 'pid');

        formNoAuthList = formCheckedList.value.filter(
          (t) =>
            formList.findIndex((t2) => t2.value == t.split(',')[0]) > -1 &&
            !myCheckMap[t.split(',')[0].toLowerCase()],
        );
      } else {
        formCheckedList.value = formCheckedList.value.filter(
          (t) => formList.findIndex((t2) => t2.value == t.split(',')[0]) != -1,
        );
        myFormList.value = toTree(formList, 'value', 'pid');
        formNoAuthList = [];
      }
    } else {
      myFormList.value = [];
      formCheckedList.value = [];
      formNoAuthList = [];
    }
    formCheckedListBySetting.value = formCheckedList.value;
  };

  const handleFormCheck = (row, isLook: boolean) => {
    let type = 0;
    if (row.isLook == true) {
      type = 1;
    } else if (isLook) {
      row.isEdit = false;
    }

    if (row.isEdit == true) {
      type = 2;
      if (!isLook) {
        row.isLook = true;
      }
    }

    const checkRowIndex = formCheckedListBySetting.value.findIndex(
      (t) => t.split(',')[0].toLowerCase() == row.value.toLowerCase(),
    );
    if (checkRowIndex != -1) {
      formCheckedListBySetting.value.splice(checkRowIndex, 1);
    }

    if (type != 0) {
      formCheckedListBySetting.value.push(`${row.value},${type}`);
    }
  };
  const cancelFormCheck = async () => {
    await loadFormModuleAuthorizeData(formModuleId.value);
  };
  const saveFormCheck = async () => {
    if (!selectObjId.value) {
      return;
    }
    fullScreenLoading(true);
    const ids: string[] = [];
    ids.push(...formCheckedListBySetting.value);
    ids.push(...formNoAuthList);
    const data = {
      ids,
      objectType: 2,
      itemType: 40,
      parentId: formModuleId.value,
    };
    const res = await api.save(selectObjId.value, data);
    if (res) {
      success(`${t('保存成功')}!`);
      formCheckedList.value = formCheckedListBySetting.value;
    }
    fullScreenLoading(false);
  };

  // 清空选择
  const clearSelect = () => {
    // 按钮
    myButtonList.value = [];
    buttonCheckedList.value = [];
    buttonNoAuthList = [];
    buttonModuleId.value = '';

    // 列表
    myColumnList.value = [];
    columnCheckedList.value = [];
    columnNoAuthList = [];
    columnModuleId.value = '';

    // 表单
    myFormList.value = [];
    formCheckedList.value = [];
    formNoAuthList = [];
    formModuleId.value = '';
  };

  // 设置页面
  const indexRef = ref();
  const { getRef } = useIndex(
    indexRef,
    [
      {
        type: 'lr-layout',
        config: {
          left: 640,
        },
        children: [
          {
            type: 'lr-panel',
            slot: 'left',
            config: {
              bodyStyle: {
                padding: 0,
              },
            },
            children: [
              {
                id: 'userTable',
                type: 'lr-table-panel',
                config: {
                  style: {
                    padding: 0,
                  },
                  columns: userColumns,
                  rowKey: 'f_UserId',
                  immediate: true,
                  isPage: true,
                  sidx: 'F_SortCode ASC,F_CreateDate DESC',
                  loadData: async (param) => {
                    const res = await apiUser.getPages(param);
                    return res;
                  },
                  rowClick: async ({ row }) => {
                    await loadModuleAuthorizeData(row.f_UserId);
                    selectRow.value = row;
                  },
                },
              },
            ],
          },
          {
            type: 'lr-panel',
            config: {
              title: panelTitle,
              bodyStyle: {
                padding: 0,
              },
              bootmBtns: [
                {
                  label: t('取消'),
                  click: async () => {
                    const tabId = paramData.tabs2;
                    switch (tabId) {
                      case 'c0':
                        cancelModuleCheck();
                        break;
                      case 'c1':
                        cancelButtonCheck();
                        break;
                      case 'c2':
                        cancelColumnCheck();
                        break;
                      case 'c3':
                        await cancelFormCheck();
                        break;
                    }
                  },
                },
                {
                  label: t('保存'),
                  type: 'primary',
                  click: async () => {
                    const tabId = paramData.tabs2;
                    switch (tabId) {
                      case 'c0':
                        await saveModuleCheck();
                        break;
                      case 'c1':
                        await saveButtonCheck();
                        break;
                      case 'c2':
                        await saveColumnCheck();
                        break;
                      case 'c3':
                        await saveFormCheck();
                        break;
                    }
                  },
                },
              ],
            },
            children: [
              {
                id: 'tabs2',
                type: 'tabs',
                children: [
                  {
                    config: {
                      label: t('功能'),
                    },
                    children: [
                      {
                        id: 'moduleTree',
                        type: 'lr-tree',
                        config: {
                          defaultExpandAll: false,
                          valueKey: 'f_ModuleId',
                          labelKey: 'f_FullName',
                          pidKey: 'f_ParentId',
                          checkable: true,
                          list: moduleDataList,
                          emptyDes: `${t('请先选择左侧角色或用户')}!`,
                          check: (list) => {
                            const ids: string[] = [];
                            ids.push(...list);
                            moduleCheckedListBySetting.value = ids;
                          },
                        },
                      },
                    ],
                  },
                  {
                    config: {
                      label: t('按钮'),
                    },
                    children: [
                      {
                        type: 'lr-layout',
                        config: {
                          left: 320,
                        },
                        children: [
                          {
                            type: 'lr-tree',
                            slot: 'left',
                            config: {
                              style: {
                                'border-right': '1px solid var(--color-border-secondary)',
                                'overflow-y': 'auto',
                              },
                              defaultExpandAll: false,
                              valueKey: 'f_ModuleId',
                              labelKey: 'f_FullName',
                              pidKey: 'f_ParentId',
                              list: moduleDataList,
                              click: async (node) => {
                                buttonModuleId.value = node[0];
                                await loadButtonModuleAuthorizeData(node[0]);
                              },
                            },
                          },
                          {
                            id: 'buttonTree',
                            type: 'lr-tree',
                            config: {
                              style: {
                                'overflow-y': 'auto',
                              },
                              list: myButtonList,
                              checkable: true,
                              check: (list, e) => {
                                const ids: string[] = [];
                                ids.push(...list);
                                ids.push(...e.halfCheckedKeys);
                                buttonCheckedListBySetting.value = ids;
                              },
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    config: {
                      label: t('列表'),
                    },
                    children: [
                      {
                        type: 'lr-layout',
                        config: {
                          left: 320,
                        },
                        children: [
                          {
                            type: 'lr-tree',
                            slot: 'left',
                            config: {
                              style: {
                                'border-right': '1px solid var(--color-border-secondary)',
                                'overflow-y': 'auto',
                              },
                              defaultExpandAll: false,
                              valueKey: 'f_ModuleId',
                              labelKey: 'f_FullName',
                              pidKey: 'f_ParentId',
                              list: moduleDataList,
                              click: async (node) => {
                                columnModuleId.value = node[0];
                                await loadColumnModuleAuthorizeData(node[0]);
                              },
                            },
                          },
                          {
                            id: 'columnTree',
                            type: 'lr-tree',
                            config: {
                              style: {
                                'overflow-y': 'auto',
                              },
                              list: myColumnList,
                              checkable: true,
                              check: (list, e) => {
                                const ids: string[] = [];
                                ids.push(...list);
                                ids.push(...e.halfCheckedKeys);
                                columnCheckedListBySetting.value = ids;
                              },
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    config: {
                      label: t('表单'),
                    },
                    children: [
                      {
                        type: 'lr-layout',
                        config: {
                          left: 320,
                        },
                        children: [
                          {
                            type: 'lr-tree',
                            slot: 'left',
                            config: {
                              style: {
                                'border-right': '1px solid var(--color-border-secondary)',
                                'overflow-y': 'auto',
                              },
                              defaultExpandAll: false,
                              valueKey: 'f_ModuleId',
                              labelKey: 'f_FullName',
                              pidKey: 'f_ParentId',
                              list: moduleDataList,
                              click: async (node) => {
                                formModuleId.value = node[0];
                                await loadFormModuleAuthorizeData(node[0]);
                              },
                            },
                          },
                          {
                            id: 'formTree',
                            type: 'lr-table',
                            config: {
                              isTree: true,
                              columns: [
                                { label: '名称', prop: 'name', minWidth: '100' },
                                {
                                  label: '编辑',
                                  prop: 'isEdit',
                                  width: '64',
                                  align: 'center',
                                  config: {
                                    formatter: ({ row }) => {
                                      if (row.notEdit || row.children) {
                                        return h('div', {});
                                      }

                                      return h(Switch, {
                                        checked: row.isEdit,
                                        size: 'small',
                                        onClick: async (value) => {
                                          row.isEdit = value;
                                          handleFormCheck(row, false);
                                        },
                                      });
                                    },
                                  },
                                },
                                {
                                  label: '查看',
                                  prop: 'isLook',
                                  width: '64',
                                  align: 'center',
                                  config: {
                                    formatter: ({ row }) => {
                                      return h(Switch, {
                                        checked: row.isLook,
                                        size: 'small',
                                        onClick: async (value) => {
                                          row.isLook = value;
                                          handleFormCheck(row, true);
                                        },
                                      });
                                    },
                                  },
                                },
                              ],
                              dataSource: myFormList,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    paramData,
  );
</script>
