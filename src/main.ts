import bootstrap from './core';

const main = async () => {
  // 内置模块（src/core/modules 经 glob 装配）直接启动。
  // 「应用管理」已移除：平台不再向后端拉取应用清单，也不再运行时加载远程应用。
  bootstrap([]);
};

main();
