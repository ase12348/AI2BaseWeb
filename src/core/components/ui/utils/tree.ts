/**
 *将数组数据转化成树形数据
 */

import { deepClone } from './method';

export function setGroupMap(data: any[], idKey: string, pidKey: string) {
  const groupList: Record<string, any> = {};
  const map: Record<string, any> = {};
  data.forEach((item) => {
    groupList[item[pidKey]] = groupList[item[pidKey]] || [];
    groupList[item[pidKey]].push(item);

    map[item[idKey]] = item;
  });

  return {
    group: groupList,
    map,
  };
}
function setTree(
  data: any,
  allList: any,
  idKey: string,
  valueKey: any,
  labelKey: any,
  filterIds: any,
) {
  const res: any[] = [];
  if (data == null) {
    Object.keys(allList.group).forEach((id) => {
      if (!filterIds || filterIds.indexOf(id) === -1) {
        if (!allList.map[id]) {
          const list = allList.group[id];
          list.forEach((item2: { [propName: string]: any }) => {
            if (!filterIds || filterIds.indexOf(item2[idKey]) === -1) {
              if (valueKey) {
                item2.value = item2[valueKey];
              }
              if (labelKey) {
                item2.label = item2[labelKey];
              }

              if (allList.group[item2[idKey]] && allList.group[item2[idKey]].length > 0) {
                item2.children = setTree(
                  allList.group[item2[idKey]],
                  allList,
                  idKey,
                  valueKey,
                  labelKey,
                  filterIds,
                );
              }
              res.push(item2);
            }
          });
        }
      }
    });
  } else {
    data.forEach((item: any) => {
      if (!filterIds || filterIds.indexOf(item[idKey]) === -1) {
        if (valueKey) {
          item.value = item[valueKey];
        }

        if (labelKey) {
          item.label = item[labelKey];
        }

        if (allList.group[item[idKey]] && allList.group[item[idKey]].length > 0) {
          item.children = setTree(
            allList.group[item[idKey]],
            allList,
            idKey,
            valueKey,
            labelKey,
            filterIds,
          );
        }
        res.push(item);
      }
    });
  }

  return res;
}

// 将数据转化成树形数据
export function toTree(
  data: any[],
  _idKey?: string,
  pidKey?: string,
  valueKey?: string,
  labelKey?: string,
  filterIds?: any,
) {
  if (data.length === 0 || (!_idKey && !data[0]._id)) {
    return data;
  }

  const idKey = _idKey || '_id';
  pidKey = pidKey || '_pid';

  // 数据去重根据value值
  let _data = [];
  let _dataMap: Record<string, any> = {};

  if (valueKey) {
    data.forEach((item) => {
      if (!_dataMap[item[valueKey]]) {
        _dataMap[item[valueKey]] = true;
        _data.push(deepClone(item));
      }
    });
  } else {
    _data = data;
  }
  _dataMap = {};
  if (idKey === pidKey) {
    const res: any[] = [];
    _data.forEach((item) => {
      if (!filterIds || filterIds.indexOf(item[idKey]) === -1) {
        if (valueKey) {
          item.value = item[valueKey];
        }
        if (labelKey) {
          item.label = item[labelKey];
        }
        res.push(item);
      }
    });
    return res;
  }
  const allList = setGroupMap(_data, idKey, pidKey);

  return setTree(null, allList, idKey, valueKey, labelKey, filterIds);
}

const setArray = (list: any[], pid: string, data: any[], filterIds?: string[]) => {
  data = data || [];
  for (let i = 0, len = data.length; i < len; i++) {
    const item = data[i];
    const newItem: Record<string, any> = {};
    newItem._id = item.prop || `${pid}_${i}`;
    newItem._pid = pid;
    Object.keys(item).forEach((key) => {
      if (!filterIds || filterIds.indexOf(key) === -1) {
        newItem[key] = item[key];
      }
    });

    list.push(newItem);

    const children = item.children || [];
    if (children.length > 0) {
      newItem._hasChildren = true;
      setArray(list, newItem._id, children);
    }
  }
};
export const toArray = (data: any[], filterIds?: string[]) => {
  const list: any[] = [];
  setArray(list, '0', data, filterIds);
  return list;
};

const setSimpleTree = (list: any[], data: any[], valueKey: string, labelKey: string) => {
  data = data || [];
  for (let i = 0, len = data.length; i < len; i++) {
    const item = data[i];
    const newItem: Record<string, any> = {
      value: item[valueKey],
      label: item[labelKey],
    };
    list.push(newItem);
    const children = item.children || [];
    if (children.length > 0) {
      newItem.children = [];
      setSimpleTree(newItem.children, children, valueKey, labelKey);
    }
  }
};
export const toSimpleTree = (data: any[], valueKey?: string, labelKey?: string) => {
  const list: any[] = [];
  setSimpleTree(list, data, valueKey || 'value', labelKey || 'label');
  return list;
};
