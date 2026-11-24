export const useFlow = ({
  data,
  actions,
  utils,
  inputParams,
  notRunActions,
}: Record<string, any>) => {
  const getNextNodeIds = (nodeId: string) => {
    const line = data.filter((item: any) => item.source === nodeId);
    return line.map((t: any) => t.target);
  };

  const run = async (nodeId?: string) => {
    nodeId = nodeId || 'start';
    const node = data.find((item: any) => item.id === nodeId);
    if (node.config.type === 'start') {
      // 如果是开始节点，就继续往下执行
      const nodes = getNextNodeIds(nodeId);
      for (let i = 0; i < nodes.length; i++) {
        await run(nodes[i]);
      }
    } else {
      const action = actions[node.config.type];
      if (action) {
        await action(
          node.config,
          utils,
          async (data: Record<string, any>) => {
            data = data || {};
            data.nodeId = nodeId;
            if (data.next !== false) {
              const nodes = getNextNodeIds(data.nodeId);
              for (let i = 0; i < nodes.length; i++) {
                await run(nodes[i]);
              }
            }
          },
          inputParams,
          (componentId: string) => {
            notRunActions[componentId] = {
              data,
              inputParams,
            };
          },
        );
      }
    }
  };

  return {
    run,
  };
};
