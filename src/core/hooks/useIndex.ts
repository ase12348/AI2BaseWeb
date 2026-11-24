import type { PageSchemaConfig } from '/#/page';
import type { FormLayerParamType } from '/#/form';
import { onMounted, watch } from 'vue';

import { useGo } from '/@/core/hooks/usePage';

import { t } from '@/core/locales/setupI18n';

export function useIndex(refPage: any, schemas: PageSchemaConfig[], paramData?: any) {
  const setIndexConfig = (formSchema: PageSchemaConfig[]) => {
    formSchema.forEach((item) => {
      if (item.children && item.children.length > 0) {
        const children: PageSchemaConfig[] = [];
        if (['collapse', 'tabs'].includes(item.type || '')) {
          item.config = item.config || {};
          if (!item.config.groups) {
            item.config.groups = [];
            item.children.forEach((childrenItem, index) => {
              item.config?.groups.push({
                i: `c${index}`,
                label: childrenItem.config?.label,
              });
              childrenItem.children?.forEach((groupItem) => {
                groupItem.slot = `c${index}`;
                children.push(groupItem);
              });
            });
            item.config.defaultValue = 'c0';
            item.children = children;
          }
        } else {
          children.push(...item.children);
        }
        setIndexConfig(children);
      }
    });
  };

  const go = useGo();

  onMounted(() => {
    setIndexConfig(schemas);
    // 页面组件为异步组件，模板引用可能晚于父组件 mounted 才可用
    if (refPage.value) {
      refPage.value.setInit(schemas, paramData);
      return;
    }
    const stop = watch(refPage, (pageRef) => {
      if (!pageRef) {
        return;
      }
      stop();
      pageRef.setInit(schemas, paramData);
    });
  });

  const getRef = (id: string) => {
    return refPage.value.getRef(id);
  };

  const openForm = (param: FormLayerParamType) => {
    if (param.type == 'page') {
      go({
        path: '/system/form',
        query: { menuId: param.name, title: `${param.title}【${t('表单')}】` },
      });
    } else {
      refPage.value.openForm(param);
    }
  };

  return { getRef, openForm };
}
