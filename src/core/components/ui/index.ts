import type { App, Component } from 'vue';
import { defineAsyncComponent } from 'vue';

export const version = '4.0.0';

type ModuleLoader = () => Promise<any>;

// 与 core/components/index.ts 相同的异步注册方式：按目录收集主组件，首次使用时才加载
const componentModules = import.meta.glob('./*/*.vue') as Record<string, ModuleLoader>;

// 目录名转 kebab，如 cSchemaIndex -> lr-c-schema-index
const toKebabCase = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// drag 主组件内部按 lr-drag-component 互相引用，保留该名称
const nameOverrides: Record<string, string> = { drag: 'lr-drag-component' };

const componentMap: Record<string, Component> = {};
for (const [path, loader] of Object.entries(componentModules)) {
  const dir = path.split('/')[1];
  // 主组件与目录同名，其余 .vue 由下方 subComponentMap 显式注册
  if (path !== `./${dir}/${dir}.vue`) continue;
  componentMap[nameOverrides[dir] ?? `lr-${toKebabCase(dir)}`] = defineAsyncComponent(loader);
}

// 随主组件一起安装的子组件，单独声明以便模板直接使用
const subComponentMap: Record<string, Component> = {
  'lr-bi-viewer': defineAsyncComponent(() => import('./biDesign/biViewer.vue')),
  'lr-bi-design-container': defineAsyncComponent(() => import('./biDesign/biDesignContainer.vue')),
  'lr-c-schema-item': defineAsyncComponent(() => import('./cSchemaForm/cSchemaItem.vue')),
  'lr-c-schema-index-item': defineAsyncComponent(
    () => import('./cSchemaIndex/cSchemaIndexItem.vue'),
  ),
  'lr-drag-tool': defineAsyncComponent(() => import('./drag/tool.vue')),
  'lr-drag-container': defineAsyncComponent(() => import('./drag/container.vue')),
  'lr-drag-list': defineAsyncComponent(() => import('./drag/dragList.vue')),
  'lr-drag-index-list': defineAsyncComponent(() => import('./drag/dragIndexList.vue')),
  'lr-form-design-item': defineAsyncComponent(() => import('./formDesign/item.vue')),
  'lr-index-design-item': defineAsyncComponent(() => import('./indexDesign/item.vue')),
  'lr-imenu': defineAsyncComponent(() => import('./menu/imenu.vue')),
  'lr-hmenu': defineAsyncComponent(() => import('./menu/hmenu.vue')),
  'lr-vmenu': defineAsyncComponent(() => import('./menu/vmenu.vue')),
  'lr-sub-menu': defineAsyncComponent(() => import('./menu/subMenu.vue')),
  'lr-menu-item': defineAsyncComponent(() => import('./menu/menuItem.vue')),
  'lr-quick-bi-viewer': defineAsyncComponent(() => import('./quickBiDesign/quickBiViewer.vue')),
  'lr-slider-captcha-action': defineAsyncComponent(
    () => import('./sliderCaptcha/sliderCaptchaAction.vue'),
  ),
  'lr-slider-captcha-bar': defineAsyncComponent(
    () => import('./sliderCaptcha/sliderCaptchaBar.vue'),
  ),
  'lr-slider-captcha-content': defineAsyncComponent(
    () => import('./sliderCaptcha/sliderCaptchaContent.vue'),
  ),
};

export function install(app: App) {
  for (const [name, component] of Object.entries({ ...componentMap, ...subComponentMap })) {
    app.component(name, component);
  }
}

export const Icon = componentMap['lr-icon'];
export const Buttons = componentMap['lr-buttons'];
export const dragContainer = subComponentMap['lr-drag-container'];
export const dragList = subComponentMap['lr-drag-list'];

// 工具函数静态导出，避免调用方拿到异步组件
export { useSortable } from '@/core/hooks/useSortable';
export { toTree, toArray } from './utils/tree';
export {
  deepClone,
  buildShortUUID,
  buildUUID,
  deepMerge,
  getObjType,
  clearData,
  uniqueArray,
  fullScreenLoading,
  upFirst,
  lowerFirst,
  getFunction,
} from './utils/method';
export { isNullOrEmpty } from './utils/is';
export {
  formatToDateTime,
  formatToDate,
  calcDate,
  calcDateHours,
  calcDateText,
  getDayText,
} from './utils/date';
export { HashingFactory, EncryptionFactory, myAesDecrypt } from './utils/cipher';
export { toPt, toPx, mmToPt } from './utils/number';
export { getBarcodeImg } from './utils/barcode';
export { useActions } from './utils/useActions';
export { toFormSchema } from './formDesign/utils';
export { toIndexSchema } from './indexDesign/utils';
export { countFileSize } from './utils/file';
export { addIcon } from '@iconify/vue';
export { useFramework } from './utils/useFramework';

export default {
  version,
  install,
};
