import type { App } from 'vue';
import type { I18nOptions } from 'vue-i18n';
import { createI18n } from 'vue-i18n';
import { useLangTypeStoreWithOut } from '/@/core/store/language/type';
import { useLangMappingStoreWithOut } from '/@/core/store/language/mapping';

async function createI18nOptions(): Promise<I18nOptions> {
  const langTypeStore = useLangTypeStoreWithOut();
  const langMappingStore = useLangMappingStoreWithOut();
  const message = await langMappingStore.setAntdLocale(
    langTypeStore.getMainType,
    langTypeStore.getCurrentType,
  );

  return {
    legacy: false,
    locale: 'jcode',
    fallbackLocale: 'jcode',
    messages: {
      jcode: message,
    },
    silentTranslationWarn: true, // true - warning off
    missingWarn: false,
    silentFallbackWarn: true,
  };
}

let i18n;
export const t = (key: string) => {
  if (!key) return '';
  if (typeof key !== 'string') {
    return key;
  }
  let res = key;
  if (i18n) {
    res = i18n.global.t(key);
    if (res === '') {
      return key;
    }
  }
  return res.replace(/\$.[^\\$\\$]*\$/, '');
};
// setup i18n instance with glob
export async function setupI18n(app: App) {
  const options = await createI18nOptions();
  i18n = createI18n(options);
  app.use(i18n);
  app.config.globalProperties.$t = t;
}
