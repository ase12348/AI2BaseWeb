import type { AppPageConfig } from '/#/page';
import { LAYOUT } from '@/core/router/constant';
import getPageAuth from '@/core/utils/pageAuth';
import module from '../module';

const pageViews = [];
const pageAuthData: Record<string, any> = {};
const importPages = import.meta.glob(`../views/**/page.ts`, { eager: true });
const importPageComponents = import.meta.glob(`../views/**/index.vue`);

Object.keys(importPages || {}).forEach((fileName) => {
  // @ts-ignore
  const appPageConfig = importPages[fileName].default as AppPageConfig;

  const meta: Record<string, any> = {};
  const authData: Record<string, any> = getPageAuth(appPageConfig);
  Object.keys(appPageConfig).forEach((key) => {
    if (!['columns', 'buttons', 'forms'].includes(key)) {
      meta[key] = appPageConfig[key];
    }
  });

  const pageComponent = importPageComponents[fileName.replace('page.ts', 'index.vue')];
  const path = `/${module.code}/${fileName.replace('../views/', '').replace('/page.ts', '')}`;

  if (pageComponent != undefined) {
    const name = `${path.slice(1).replace(/\//g, '_')}_index`;
    if (meta.isNotTab) {
      // @ts-ignore
      pageViews.push({
        path: `${path}`,
        name: name,
        meta: meta,
        // @ts-ignore
        component: pageComponent,
      });
      pageAuthData[`${path}`.toLowerCase()] = authData;
    } else {
      // @ts-ignore
      pageViews.push({
        path: path,
        component: LAYOUT,
        redirect: `${path}/index`,
        children: [
          {
            path: `${path}/index`,
            name: name,
            meta: meta,
            // @ts-ignore
            component: pageComponent,
          },
        ],
      });
      pageAuthData[`${path}/index`.toLowerCase()] = authData;
    }
  }
});

export { pageViews as routes, pageAuthData };
