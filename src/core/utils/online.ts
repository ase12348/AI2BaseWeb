import { useUserStoreWithOut } from '/@/core/store/organization/user';
import { useUrl } from '@/core/hooks/useUrl';
import { api } from '@/core/modules/organization/api/user';

const userStore = useUserStoreWithOut();
const { getLastTime } = useUrl();
const onlineInit = async () => {
  // 1.判断是否登录
  const token = userStore.getToken;
  if (token) {
    // 2.判断5分钟内是否有请求，如果没有就发一个心跳包
    const times = getLastTime();
    // console.log(times, 'onlineInit');
    if (times == -1 || times >= 5) {
      await api.getheart();
    }
  }

  setTimeout(onlineInit, 60000 * 4);
};

export { onlineInit };
