const modules = [];
const importModules = import.meta.glob(`./**/moduleIndex.ts`, { eager: true });
Object.keys(importModules || {}).forEach((fileName) => {
  // @ts-ignore
  const func = importModules[fileName].default;
  // @ts-ignore
  modules.push(func);
});

export default modules;
