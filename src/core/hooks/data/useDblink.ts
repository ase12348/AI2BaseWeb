import { computed } from 'vue';
import { useDblinkStore, type dblinkEntity } from '/@/core/store/data/dblink';

import { t } from '@/core/locales/setupI18n';

export function useDblink() {
  const dblinkStore = useDblinkStore();

  const loadDblinkList = async (isCache: boolean = true) => {
    return await dblinkStore.load(isCache);
  };

  const clearDblinkList = () => {
    dblinkStore.clear();
  };

  const getDblinks = computed(() => {
    return dblinkStore.list;
  });

  const getDblinkTree = computed(() => {
    let list: dblinkEntity[] = [
      {
        f_Id: '',
        f_DbType: '',
        f_ServerAddress: '',
        f_DBName: 'lrsystemdb',
        f_DBAlias: t('系统数据库'),
        f_Description: `${t('系统数据库')},appsettings${t('中设置')},${t('无法删除')}`,
      },
    ];
    list = list.concat(getDblinks.value);
    const res: any[] = [];
    const map = {};
    list.forEach((item) => {
      let point: any = {};
      if (item.f_DBName == 'lrsystemdb') {
        point = {
          id: '1',
          label: t('常用数据库'),
          children: [
            {
              id: item.f_DBName,
              value: item.f_DBName,
              label: item.f_DBAlias,
            },
          ],
        };
        res.push(point);
      } else {
        if (!map[item.f_ServerAddress]) {
          point.id = item.f_ServerAddress;
          point.value = item.f_ServerAddress;
          point.label = item.f_ServerAddress;

          map[item.f_ServerAddress] = [];
          point.children = map[item.f_ServerAddress];
          res.push(point);
        }

        const cpoint = {
          id: item.f_DBName,
          value: item.f_DBName,
          label: '(' + item.f_DBName + ')' + item.f_DBAlias,
        };

        map[item.f_ServerAddress].push(cpoint);
      }
    });
    return res;
  });
  const getDblinkTreeNoSystem = computed(() => {
    let list: dblinkEntity[] = [
      {
        f_Id: '',
        f_DbType: '',
        f_ServerAddress: '',
        f_DBName: 'lrsystemdb',
        f_DBAlias: t('系统数据库'),
        f_Description: `${t('系统数据库')},appsettings${t('中设置')},${t('无法删除')}`,
      },
    ];
    list = list.concat(getDblinks.value);
    const res: any[] = [];
    const map = {};
    list.forEach((item) => {
      const point: any = {};
      if (item.f_DBName != 'lrsystemdb') {
        if (!map[item.f_ServerAddress]) {
          point.id = item.f_ServerAddress;
          point.value = item.f_ServerAddress;
          point.label = item.f_ServerAddress;

          map[item.f_ServerAddress] = [];
          point.children = map[item.f_ServerAddress];
          res.push(point);
        }

        const cpoint = {
          id: item.f_DBName,
          value: item.f_DBName,
          label: '(' + item.f_DBName + ')' + item.f_DBAlias,
        };

        map[item.f_ServerAddress].push(cpoint);
      }
    });
    return res;
  });

  return {
    getDblinks,
    getDblinkTree,
    getDblinkTreeNoSystem,
    loadDblinkList,
    clearDblinkList,
  };
}
