/**
 * 管理页面或表单的加载数据（下拉等）
 */
import { ref } from 'vue';
import { defHttp } from '/@/core/utils/http/axios';
import { toTree } from '@/core/utils/jcode';

const useData = () => {
  const api = {
    getCodeTableColumns: async (code: string) => {
      const codeList = code.split(',');
      const dbcode = codeList[0];
      const tableNames = codeList[1];

      if (!dbcode || !tableNames) return [];

      const res = await defHttp.get({
        url: `data/codeTables/${dbcode}`,
        method: 'get',
        params: { tableNames },
      });

      if (res && res.length > 0) {
        return res[0].lr_db_codecolumnsList.map((t) => ({
          label: t.f_Description ? `${t.f_DbColumnName}(${t.f_Description})` : t.f_DbColumnName,
          value: t.f_DbColumnName,
          csType: t.f_CsType,
          isIdentity: t.f_IsIdentity == 1,
          isPrimary: t.f_IsPrimaryKey == 1,
          isNullable: t.f_IsNullable == 1,
          coment: t.f_Description,
        }));
      }
      return [];
    },
    /**
     * @description: 获取ColNameList
     */
    getDbsourceColumns: async (code: string) => {
      const res = await defHttp.get(
        { url: `data/dbsource/${code}/colnames` },
        { errorMessageMode: 'none' },
      );

      if (res && res.length > 0) {
        return res.map((t) => ({
          value: t,
          label: t,
        }));
      }
      return [];
    },
  };

  const keyMap = {
    tableColumns: {
      label: 'label',
      value: 'value',
    },
    dbsourceColumns: {
      label: 'label',
      value: 'value',
    },
  };

  const dataMap: Record<string, any> = {};
  const loadDataState = ref<Record<string, number>>({}); // 1加载中 9加载完成
  const loadData = async (type: string, code: string) => {
    const myCode = `jcode_datacode_${type}_${code}`;
    if (loadDataState.value[myCode] === 1 || loadDataState.value[myCode] === 9) return;
    loadDataState.value[myCode] = 1;
    switch (type) {
      case 'tableColumns':
        {
          const columns = await api.getCodeTableColumns(code);
          dataMap[myCode] = columns;
        }
        break;
      case 'dbsourceColumns':
        {
          const columns = await api.getDbsourceColumns(code);
          dataMap[myCode] = columns;
        }
        break;
    }
    loadDataState.value[myCode] = 9;
    return;
  };
  const getData = (
    type: string,
    code: string,
    config?: {
      labelKey: string;
      valueKey: string;
      filterIds?: string[];
      keyword?: string;
      isTree?: boolean;
      idKey?: string;
      pidKey?: string;
    },
  ) => {
    loadData(type, code);
    const myCode = `jcode_datacode_${type}_${code}`;
    if (loadDataState.value[myCode] === 9) {
      const list = dataMap[myCode] || [];
      console.log(list, 'testList');
      if (config) {
        if (config.isTree) {
          return toTree(
            list,
            config.idKey || keyMap[type].idKey,
            config.pidKey || keyMap[type].pidKey,
            config.valueKey || keyMap[type].value,
            config.labelKey || keyMap[type].label,
            config.filterIds,
          ); // 转树
        }

        const res: Record<string, any>[] = [];
        list.forEach((t: Record<string, any>) => {
          const item: Record<string, any> = { ...t };
          item.label = item[config.labelKey || keyMap[type]?.label || 'label'];
          item.value = item[config.valueKey || keyMap[type]?.value || 'value'];
          if (config.filterIds && config.filterIds.includes(item.value)) return;
          if (config.keyword && !item.label.includes(config.keyword)) return;
          res.push(item);
        });
        return res;
      }
      return list;
    }
    return [];
  };

  // 数据字典
  // 数据视图
  // 单位组织数据
  // 接口数据

  return {
    getData,
  };
};

export default useData;
