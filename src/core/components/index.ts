import { defineAsyncComponent } from 'vue';

const components = [];
// ui 组件库由 core/components/ui 自行注册，这里排除
const importComponents = import.meta.glob(['./**/index.vue', '!./ui/**']);

Object.keys(importComponents || {}).forEach((key) => {
  const keys = key.split('/');
  const name = `lr-${keys[keys.length - 2]}`;
  // @ts-ignore
  components.push({
    name,
    // @ts-ignore
    component: defineAsyncComponent(importComponents[key]),
  });
});

// @ts-ignore
const install = (app: App) => {
  for (const item of components) {
    // @ts-ignore
    app.component(item.name, item.component);
  }
};

export default {
  install,
};
