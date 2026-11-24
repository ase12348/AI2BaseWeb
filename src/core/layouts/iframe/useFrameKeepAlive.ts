import { computed, unref } from 'vue';
import { useRouter } from 'vue-router';
import { useMultipleTabStore, type tabItem } from '/@/core/store/modules/multipleTab';
import { getRouteId } from '/@/core/utils';
import { useUserStore } from '/@/core/store/organization/user';

export function useFrameKeepAlive() {
  const userStore = useUserStore();
  const router = useRouter();
  const { currentRoute } = router;
  const tabStore = useMultipleTabStore();
  const getFramePages = computed(() => {
    return tabStore.getTabList
      .filter((t) => t.frameSrc)
      .map((t) => {
        const frameSrc = t.frameSrc?.replace(`lrtoken=`, `token=${userStore.getToken}`);
        console.log(frameSrc, 'getTabList');
        return { ...t, frameSrc };
      });
  });

  function showIframe(item: tabItem) {
    return item.id === getRouteId(unref(currentRoute));
  }

  return { getFramePages, showIframe };
}
