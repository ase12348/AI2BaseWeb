<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { deepClone } from '@/core/utils/jcode';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { useLanguage } from '/@/core/hooks/setting/useLanguage';
  import { useLangTypeStoreWithOut } from '/@/core/store/language/type';
  import { api as mappingApi } from '../../api/mapping';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { getTypeList } = useLanguage();
  const langTypeStore = useLangTypeStoreWithOut();

  const { getAllModuleList, getAllModuleGroup } = useMenu();
  const myModules = computed(() => {
    return getAllModuleList.value;
  });
  const columns = computed(() => {
    const _columns: any[] = [];
    getTypeList.value.forEach((item) => {
      _columns.push({ label: item.f_Name, prop: item.f_Code, minWidth: '120', isKeyword: true });
    });
    return _columns;
  });
  let moduleId = '0';

  // 按钮点击事件
  const buttonClick = {
    edit: (row) => {
      openForm({
        title: t('编辑功能'),
        name: 'language_module_form',
        param: { isEdit: !!row.f_code, row },
        afterOk: () => {
          refreshTable();
        },
      });
    },
  };

  // 页面权限处理
  const { getButtons } = useAuth(pageInfo, { buttonClick });

  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };

  const indexRef = ref();
  const { getRef, openForm } = useIndex(indexRef, [
    {
      type: 'lr-layout',
      children: [
        {
          type: 'lr-panel',
          slot: 'left',
          config: {
            title: '功能目录',
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                defaultExpandAll: false,
                valueKey: 'f_ModuleId',
                labelKey: 'f_FullName',
                pidKey: 'f_ParentId',
                list: myModules,
                click: (node) => {
                  if (node && node.length > 0) {
                    moduleId = node[0];
                  } else {
                    moduleId = '0';
                  }
                  refreshTable();
                },
              },
            },
          ],
        },
        {
          id: 'mainTable',
          type: 'lr-table-panel',
          config: {
            mode: 'client',
            columns: columns.value,
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: true,
            loadData: async () => {
              const _tableData: any[] = [];
              const mappingDic: Record<string, any> = {};
              const modules = getAllModuleGroup.value[moduleId] || [];
              if (modules.length > 0) {
                // 获取翻译数据
                const mappingData = await mappingApi.getModuleList(moduleId, 1);
                mappingData.forEach((row) => {
                  mappingDic[row[langTypeStore.getMainType]] = row;
                });
                modules.forEach((item) => {
                  if (mappingDic[item.f_FullName]) {
                    _tableData.push(mappingDic[item.f_FullName]);
                  } else {
                    const _row = {};
                    _row[langTypeStore.getMainType] = item.f_FullName;
                    _tableData.push(_row);
                  }
                });
                return _tableData;
              } else {
                const module = myModules.value.find((t) => t.f_ModuleId == moduleId);
                if (module && module.f_Target == 'view') {
                  const mappingData2 = await mappingApi.getModuleList(moduleId, 0);
                  mappingData2.forEach((row) => {
                    mappingDic[row[langTypeStore.getMainType]] = row;
                  });

                  const buttonList = deepClone(
                    // @ts-ignore
                    (window.jcode_app_authdata[module.f_UrlAddress.toLowerCase()] || {}).buttons ||
                      [],
                  );
                  buttonList.forEach((item) => {
                    if (
                      _tableData.findIndex((t) => t[langTypeStore.getMainType] == item.label) == -1
                    ) {
                      if (mappingDic[item.label]) {
                        _tableData.push(mappingDic[item.label]);
                      } else {
                        const _row = {};
                        _row[langTypeStore.getMainType] = item.label;
                        _tableData.push(_row);
                      }
                    }
                  });
                  // @ts-ignore
                  const columnList = deepClone(
                    // @ts-ignore
                    (window.jcode_app_authdata[module.f_UrlAddress.toLowerCase()] || {}).columns ||
                      [],
                  );
                  columnList.forEach((item) => {
                    if (
                      _tableData.findIndex((t) => t[langTypeStore.getMainType] == item.label) == -1
                    ) {
                      if (mappingDic[item.label]) {
                        _tableData.push(mappingDic[item.label]);
                      } else {
                        const _row = {};
                        _row[langTypeStore.getMainType] = item.label;
                        _tableData.push(_row);
                      }
                    }
                  });

                  // @ts-ignore
                  const formList = deepClone(
                    // @ts-ignore
                    (window.jcode_app_authdata[module.f_UrlAddress.toLowerCase()] || {}).forms ||
                      [],
                  );
                  formList.forEach((item) => {
                    let mainName = item.name;
                    const mainNames = mainName.split('-');
                    if (mainNames.length > 1) {
                      mainName = mainNames[mainNames.length - 1];
                    }

                    if (
                      _tableData.findIndex((t) => t[langTypeStore.getMainType] == mainName) == -1
                    ) {
                      if (mappingDic[mainName]) {
                        _tableData.push(mappingDic[mainName]);
                      } else {
                        const _row = {};
                        _row[langTypeStore.getMainType] = mainName;
                        _tableData.push(_row);
                      }
                    }
                  });
                }
              }
              return _tableData;
            },
          },
        },
      ],
    },
  ]);
</script>
