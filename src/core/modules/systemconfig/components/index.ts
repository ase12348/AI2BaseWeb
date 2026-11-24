import type { AppPageConfig } from '/#/page';
import { defineAsyncComponent } from 'vue';
import module from '../module';

const components = [];

// 组件导入
const importComponents = import.meta.glob(`./**/index.vue`);
Object.keys(importComponents || {}).forEach((key) => {
  // @ts-ignore
  components.push({
    name: `lr-${key.split('/')[1]}`,
    // @ts-ignore
    component: defineAsyncComponent(importComponents[key]),
  });
});

const importViewComponents = import.meta.glob(`../views/**/*.vue`);
// 页面组件导入(包含页面和表单)
const importPages = import.meta.glob(`../views/**/page.ts`, { eager: true });
Object.keys(importPages || {}).forEach((fileName) => {
  const path = `${module.code}/${fileName.replace('../views/', '').replace('/page.ts', '')}`;
  // @ts-ignore
  const pageInfo = importPages[fileName].default as AppPageConfig;
  pageInfo.forms?.forEach((formItem) => {
    const name = `${path.replace(/\//g, '_')}_${formItem.path.replace('/', '_')}`;

    const componentForm = importViewComponents[fileName.replace('page.ts', formItem.path + '.vue')];
    if (componentForm) {
      // @ts-ignore
      components.push({
        name,
        // @ts-ignore
        component: defineAsyncComponent(componentForm),
      });
    }
  });

  if (pageInfo.isLayer) {
    const pageComponent = importViewComponents[fileName.replace('page.ts', 'index.vue')];
    const name = `${path.replace(/\//g, '_')}_index`;
    // @ts-ignore
    components.push({
      name,
      // @ts-ignore
      component: defineAsyncComponent(pageComponent),
    });
  }
});

export default components;
