import { createLocalStorage } from '/@/core/utils/cache';
import { api } from '/@/core/modules/data/api/icon';
import { addIcon } from '@/core/utils/jcode';

const ls = createLocalStorage();
const ICON_CACHE_KEY = 'icon';

const icon = {
  init: async () => {
    const cacheIcon = icon.getIcons();
    try {
      const { ver, list } = (await api.getList(cacheIcon.ver)) || {};
      if (ver && ver != cacheIcon.ver) {
        const iconList: any[] = [];
        list.forEach((item) => {
          const point = {
            code: item.f_Code,
            name: item.f_Name,
            body: item.f_Body,
            width: item.f_Width,
            height: item.f_Height,
          };
          addIcon(`jcode:${point.code}`, point);
          iconList.push(point);
        });
        ls.set(ICON_CACHE_KEY, { ver: ver || cacheIcon.ver, list: iconList });
      } else {
        cacheIcon.list.forEach((point) => {
          addIcon(`jcode:${point.code}`, point);
        });
      }
    } catch (e) {
      // console.error(e);
      cacheIcon.list.forEach((point) => {
        addIcon(`jcode:${point.code}`, point);
      });
    }
  },
  getIcons: () => {
    return ls.get(ICON_CACHE_KEY) || { ver: '', list: [] };
  },
};

export default icon;
