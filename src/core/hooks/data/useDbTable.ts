import { ref } from 'vue';
import { api as apiCodeTable } from '/@/core/modules/data/api/codeTable';

export function useDbTable() {
  const tableMap = {};
  const colOptions = ref([]);

  // 获取对应数据表的columns
  const loads = async (dbCode: string, table: string) => {
    if (!dbCode || !table) {
      return [];
    }
    tableMap[`${dbCode}-${table}`] = [];
    colOptions.value = [];

    const codeTables = await apiCodeTable.getList(dbCode, table);
    const codeTable = (codeTables || []).find((t) => t.lr_db_codetableEntity.f_TableName == table);
    const columns = (codeTable?.lr_db_codecolumnsList || []).map((t) => {
      return {
        value: t.f_DbColumnName,
        label: t.f_Description ? `${t.f_DbColumnName}(${t.f_Description})` : t.f_DbColumnName,
      };
    });
    colOptions.value = columns;
    tableMap[`${dbCode}-${table}`] = columns;
  };

  const getColOptions = (dbCode: string, table: string) => {
    if (!dbCode || !table) {
      return [];
    }

    if (!tableMap[`${dbCode}-${table}`]) {
      loads(dbCode, table);
    }
    return colOptions;
  };

  return {
    getColOptions,
  };
}
