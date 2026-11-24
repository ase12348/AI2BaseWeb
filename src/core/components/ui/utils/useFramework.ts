import { inject, ref, unref } from 'vue';
import { formatToDate, formatToDateTime } from './date';
import { isNullOrEmpty } from '../utils/is';

interface frameworkParam {
  hasCompany?: boolean;
  loadCompanyCache?: boolean;
  dataItemCodes?: string[];
}

export const useFramework = ({ hasCompany, loadCompanyCache, dataItemCodes }: frameworkParam) => {
  const {
    useDbSource,
    useDataItem,
    useOrganization,
    useMenu,
    useMessage,
    useFile,

    token,
    apiUrl,
    mapKey,
    useHttp,

    t, // 翻译的方法
    excelExport,
    excelImportDownTemplate,
    excelImportUpload,
    excelImportUploadData,
    excelImportDownTemplateByConfig,
    excelImportUploadByConfig,

    getLabelByComponent,

    // 框架数据处理
    useData,
  } = inject('jcode_app_provide', {
    useDbSource: () => ({}),
    useDataItem: () => ({}),
    useOrganization: () => ({}),
    useMenu: () => ({}),
    useMessage: () => ({}),
    useFile: () => ({}),
    useHttp: () => ({}),
    useData: () => ({}),

    t: (text: string) => text,
    excelExport: () => true,
    excelImportDownTemplate: () => true,
    excelImportUpload: () => true,
    excelImportUploadData: () => true,
    excelImportDownTemplateByConfig: () => true,
    excelImportUploadByConfig: () => true,

    getLabelByComponent: (data: Record<string, any>) => data.value,
  } as Record<string, any>);

  // 部门 用户 公司
  const {
    loadCompanyList,
    getCompanyList,
    getCompanyTree,
    loadDepartmentList,
    loadDepartment,
    getDepartmentList,
    getDepartment,
    getDepartmentTree,
    loadUser,
    getUser,
    getLoginInfo,
    getRoleName,
    getPostName,
    getUserFullName,
  } = useOrganization();

  if (hasCompany) {
    loadCompanyList(loadCompanyCache);
  }

  // 数据字典/数据字典分类
  const {
    getDataItem,
    getDataItemList,
    loadDataItemList,
    getDataItemOptions,
    loadClassifyList,
    getClassifysOptions,
  } = useDataItem(dataItemCodes);

  // 数据源/数据视图
  const {
    getDbSourceList,
    getDbSourceOne,
    loadDbSourceList,
    loadDbSource,
    getDbSourceOptions,
    getList,
    getPages,
  } = useDbSource();
  const getDbSourceKey = (code: string, params?: Record<string, any>) => {
    let key = code;
    if (params) {
      key += `_${JSON.stringify(params)}`;
    }
    return key;
  };

  // 菜单
  const { getAllModuleDic } = useMenu();

  //
  let useDataRes: any;
  if (useData) {
    useDataRes = useData();
  }

  const getLabel = (
    value: string | number | boolean,
    config: Record<string, any>,
    row?: Record<string, any>,
  ) => {
    // console.log(value, config, getCompanyList.value, 'getLabel')
    if (!(config && !isNullOrEmpty(value))) return value;
    switch (config.dataType) {
      case 'options': {
        const optionsRef = config?.loadOptions ? unref(config?.loadOptions()) : ref([]);
        config.options = config.options || optionsRef || [];
        const idList = String(value).split(',');
        return idList
          .map((id) => config.options.find((t: any) => t.value + '' === id + '')?.label || id)
          .join(',');
      }
      case 'company': {
        const companyObj = getCompanyList.value.find((t: any) => t.f_CompanyId === value);
        return companyObj ? companyObj[config.labelKey || 'f_FullName'] : value;
      }
      case 'department':
        loadDepartment(value);
        return getDepartment.value[value as string]
          ? getDepartment.value[value as string][config.labelKey || 'f_FullName']
          : value;
      case 'user': {
        loadUser(value);
        const userIdList = String(value).split(',');
        const names: any[] = [];
        userIdList.forEach((userId) => {
          const user = getUser.value[userId as string];
          names.push(user?.f_RealName || userId);
        });
        return String(names);
      }
      case 'fullUser': {
        return getUserFullName(value);
      }
      case 'role':
        return getRoleName(value, config.labelKey);
      case 'post':
        return getPostName(value, config.labelKey);
      case 'date':
        return formatToDate(value as string | number, config.format);
      case 'dateTime':
        return formatToDateTime(value as string | number, config.format);
      case 'dataItem': {
        loadDataItemList(config.dataCode, true);
        const dataItemList = getDataItemList(config.dataCode || '');
        const values = String(value).split(',');
        const labels: any[] = [];
        values.forEach((v) => {
          const dataItem = dataItemList.find((t: any) => t[config.valueKey || 'f_ItemValue'] === v);
          labels.push(dataItem ? dataItem[config.labelKey || 'f_ItemName'] : v);
        });
        return labels.join(',');
      }
      case 'dataSource': {
        const params = config.params || {};
        if (config.upId && row) {
          params[config.upKey || 'param'] = row[config.upId];
        }
        const values = String(value).split(',');
        const labels: any[] = [];
        values.forEach((v) => {
          let dataSource = getDbSourceOne.value[`${config.dataCode}_${config.valueKey}_${v}`];
          if (!dataSource) {
            loadDbSource(config.dataCode || '', config.valueKey, v as string, params);
          }
          dataSource = getDbSourceOne.value[`${config.dataCode}_${config.valueKey}_${v}`];
          labels.push(dataSource ? dataSource[config.labelKey || ''] : v);
        });
        return labels.join(',');
      }
      case 'menu': // 功能模块,菜单
        return getAllModuleDic.value[value as string]?.f_FullName || value;
    }

    if (useDataRes?.getLabel) {
      return useDataRes.getLabel({ value, config, row });
    }

    return value; // useDataRes.getLabel
  };

  return {
    // 公司
    loadCompanyList,
    getCompanyList,
    getCompanyTree,

    // 部门
    loadDepartmentList,
    getDepartmentList,
    getDepartmentTree,

    // 人员
    getLoginInfo,

    // 数据字典
    getDataItem,
    getDataItemList,
    loadDataItemList,
    getDataItemOptions,
    loadClassifyList,
    getClassifysOptions,

    // 数据源/数据视图
    getDbSourceList,
    getDbSourceOne,
    loadDbSourceList,
    loadDbSource,
    getDbSourceOptions,
    getDbSourceKey,

    fetchDbSourceList: getList, // 加载数据源，无缓存
    fetchDbSourcePages: getPages, // 加载数据源分页数据

    getLabel,

    // 系统信息
    token,
    apiUrl,
    mapKey,

    useMessage,
    useFile,
    useHttp,

    t,
    excelExport,
    excelImportDownTemplate,
    excelImportUpload,
    excelImportUploadData,
    excelImportDownTemplateByConfig,
    excelImportUploadByConfig,

    getLabelByComponent,

    useData: useData || (() => undefined),
  };
};
