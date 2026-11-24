import { watch, unref } from 'vue';
import { t } from '@/core/locales/setupI18n';
import { useTitle as usePageTitle } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { useGlobSetting } from '/@/core/hooks/setting';
import { getRouteId } from '/@/core/utils';
import { useMenu } from '/@/core/hooks/useMenu';

/**
 * Listening to page changes site titles
 */
export function useTitle() {
  const { title } = useGlobSetting();
  const { currentRoute } = useRouter();
  const pageTitle = usePageTitle();
  const { getModuleByCode } = useMenu(true);

  watch(
    [() => currentRoute.value.path],
    () => {
      const route = unref(currentRoute);
      const moduleCode = getRouteId(route);
      const moduleObject = getModuleByCode(moduleCode);
      // @ts-ignore
      const tTitle = t(moduleObject?.f_FullName || route?.meta?.title || route?.query?.title || '');
      pageTitle.value = tTitle ? ` ${tTitle} - ${t(title)} ` : `${t(title)}`;
    },
    { immediate: true },
  );
}
