import { fullScreenLoading } from './method';

export interface ActionModel {
  name: string; // 执行名称
  method: any; // 方法
}

export function useActions({ actions }: { actions: ActionModel[] }) {
  return new Promise((resolve) => {
    let myIndex = 0;

    const callBack = async (data: Record<string, any>) => {
      data = data || {};

      if (data.next !== false) {
        if (!data.next) {
          if (myIndex + 1 < actions.length) {
            await executeAction(myIndex + 1, data.paramData);
          } else {
            resolve(data.paramData);
          }
        } else {
          const index = actions.findIndex((item) => item.name === data.next);
          if (index !== -1) {
            await executeAction(index, data.paramData);
          } else {
            resolve(data.paramData);
          }
        }
      } else {
        resolve(data.paramData);
      }
    };

    const executeAction = async (index: number, paramData: Record<string, any>) => {
      fullScreenLoading(true);
      myIndex = index;
      const action = actions[index];
      if (action) {
        const res = await action.method({ paramData, callBack });
        if (res) {
          await callBack(res);
        }
      } else {
        resolve(paramData);
      }
      fullScreenLoading(false);
    };

    if (actions.length > 0) {
      executeAction(myIndex, {});
    }
  });
}
