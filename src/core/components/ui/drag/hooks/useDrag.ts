import type { DesignComponent } from '../interface';
import { ref, onMounted, onUnmounted, inject, ComputedRef, nextTick } from 'vue';
import { emitEvent, onEvent, offEvent } from '../eventBus';

export const useDrag = (
  refDrag: any,
  componentData: DesignComponent,
  dragType: string,
  childComponents?: ComputedRef<Record<string, any>[]>,
  isComponentContainer?: boolean,
  groupId?: string,
) => {
  const myId = componentData.id;
  const myLevel = componentData.level;

  const {
    getDesignLocals,
    selectComponent,
    getComponent,
    isMyChildComponent,
    addComponent,
    deleteComponent,
    getParentComponents,
    removeComponentFromContainer,
    addComponentToContainer,
    copyComponent,
    activedComponent,
    top,
  } = inject('jcode-darg-design-provide', {} as Record<string, any>);

  const mouseEnterBuff: string[] = [];

  const isHover = ref(false);
  const isSelect = ref(false);
  const isToContainer = ref(false); // 如果是目标移入容器
  const isBottomToolBar = ref(false);
  const isMoveingInTopLevel = ref(false); // 有组件拖动中
  const toBlock = { id: '', type: '' }; // 移动到对应的目标快位置

  const isTopActive = ref(false); // 对应目标元素的上
  const isBottomActive = ref(false); // 对应目标元素的下

  let myMoveId = '';
  let myLocal: any = null;
  const getLocal = (moveId: string) => {
    if (myMoveId === moveId) {
      return myLocal;
    }
    myMoveId = moveId;
    const { top, left, width, height } = refDrag.value.getBoundingClientRect();
    myLocal = [
      { x: left, y: top },
      { x: left + width, y: top },
      { x: left + width, y: top + height },
      { x: left, y: top + height },
    ]; // 4个点位置
    return myLocal;
  };

  const getDistance = (x: number, y: number, locals: Array<{ x: number; y: number }>) => {
    // 获取水平线条的距离，返回最短的一条距离
    // 1.上水平线距离
    let ly1 = y - locals[0].y;
    if (ly1 < 0) {
      ly1 = -ly1;
    }
    // 2.下水平线距离
    let ly2 = y - locals[3].y;
    if (ly2 < 0) {
      ly2 = -ly2;
    }

    // 3.左侧距离
    let lx1 = x - locals[0].x;
    if (lx1 < 0) {
      lx1 = -lx1;
    }

    // 4.左侧距离
    let lx2 = x - locals[1].x;
    if (lx2 < 0) {
      lx2 = -lx2;
    }

    return {
      ly: ly1 > ly2 ? ly2 : ly1,
      typey: ly1 > ly2 ? 'bottom' : 'top',
      lx: lx1 > lx2 ? lx2 : lx1,
      // typex: lx1 > lx2 ? 'bottom' : 'top',
      lallx: lx1 + lx2,
    };
  };

  const isInContainer = (x: number, y: number, locals: Array<{ x: number; y: number }>) => {
    if (x >= locals[0].x && x <= locals[1].x && y >= locals[0].y && y <= locals[3].y) {
      return true;
    }
    return false;
  };

  const activeComponent = () => {
    if (!isSelect.value) {
      selectComponent(myId);
      if (myLevel !== 0) {
        const locals = refDrag.value.getBoundingClientRect();
        const parentLocals = getDesignLocals();

        if (locals.top - parentLocals.top < 22) {
          isBottomToolBar.value = true;
        } else {
          isBottomToolBar.value = false;
        }
      }

      isSelect.value = true;

      emitEvent('dragClick', {
        id: myId,
      });
    }
  };

  const deleteComponentByClick = (id: string) => {
    const selectId = deleteComponent(id);
    if (selectId) {
      nextTick(() => {
        emitEvent('dragClick', {
          id: selectId,
        });
      });
    }
  };

  const removeMoving = () => {
    // 移除拖拽状态
    toBlock.id = '';
    toBlock.type = '';
    if (myLevel === 0) {
      isMoveingInTopLevel.value = false;
    }
  };

  // 鼠标移入移出
  const onMouseenter = () => {
    emitEvent('mouseEnterOrLeave', { id: myId, type: 'enter' });
  };
  const onMouseleave = () => {
    emitEvent('mouseEnterOrLeave', { id: myId, type: 'leave' });
  };

  // 工具栏操作方法
  const handleComponentClick = (id: string) => {
    emitEvent('dragClick', {
      id,
    });
  };

  const eventBus: Record<string, any> = {
    mouseEnterOrLeave: ({ id, type }: { id: string; type: string }) => {
      if (type === 'enter') {
        mouseEnterBuff.push(id);
      } else if (mouseEnterBuff.length > 0) {
        mouseEnterBuff.splice(mouseEnterBuff.length - 1, 1);
      }

      const len = mouseEnterBuff.length;

      if (len > 0 && myId === mouseEnterBuff[len - 1]) {
        isHover.value = true;
      } else {
        isHover.value = false;
      }
    },

    dragAciveChild: ({ type, id }: { type: string; id: string }) => {
      if (id === myId) {
        if (type === 'top') {
          isTopActive.value = true;
          isBottomActive.value = false;
        } else {
          isBottomActive.value = true;
          isTopActive.value = false;
        }
      } else {
        isBottomActive.value = false;
        isTopActive.value = false;
      }

      /* if (dragType === 'container' && isToContainer.value && id && type) {
        toBlock.id = id
        toBlock.type = type
      } */
    },

    // 广播点击事件
    dragClick({ id, isAgain }: { id: string; isAgain: boolean }) {
      if (id !== myId) {
        isSelect.value = false;
      } else {
        if (isAgain) {
          isSelect.value = false;
        }
        activeComponent();
      }
    },
  };

  // 判断到子元素的距离
  eventBus[`dragGetChildDistance_${myId}`] = ({
    dragX,
    dragY,
    moveId,
  }: {
    dragX: number;
    dragY: number;
    moveId: string;
  }) => {
    const locals = getLocal(moveId);
    return getDistance(dragX, dragY, locals);
  };

  const eventContainerBus: Record<string, any> = {
    // 判断是否在当前容器里
    isInContainer({ x, y, id, moveId }: { x: number; y: number; id: string; moveId: string }) {
      if (myId === id || isMyChildComponent(id, myId) /* 如果移动元素是当前容器父级元素 */) {
        isToContainer.value = false;
        return { isIn: false, level: myLevel, id: myId, groupId };
      }

      const locals = getLocal(moveId);

      // 判断是否在容器里吗
      if (isInContainer(x, y, locals)) {
        if (myLevel === 0) {
          isMoveingInTopLevel.value = true;
        }
        return { isIn: true, level: myLevel, id: myId, groupId };
      }

      if (myLevel === 0) {
        // 如果是页面容器，需要判断是否页面正上下端 20px 附近
        const { ly, lx } = getDistance(x, y, locals);
        if (ly < 20 && lx < 20) {
          isMoveingInTopLevel.value = true;
          return { isIn: true, level: myLevel, id: myId, groupId };
        }
        isMoveingInTopLevel.value = false;
      }

      // 表示不在容器中
      isToContainer.value = false;
      return { isIn: false, level: myLevel, id: myId, groupId };
    },
    // 确定当前容器为目标容器
    dragActiveContainer: ({
      containerId,
      containerGroupId,
      dragX,
      dragY,
      moveId,
    }: {
      containerId: string;
      dragX: number;
      dragY: number;
      moveId: string;
      containerGroupId: string;
    }) => {
      if (containerId === myId && containerGroupId === groupId) {
        isToContainer.value = true;
        // 发送信息判断组件具体的位置
        if (childComponents && childComponents.value.length > 0) {
          // 广播给子集,距离谁近
          let nowDrag = {
            ly: 9999999,
            lx: 0,
            lallx: 0,
            id: '',
            // isX: false, // 是否根据横向判断
            // typex: '',
            typey: '',
          };
          childComponents?.value.forEach((item) => {
            if (groupId && item.groupId !== groupId) return;

            const res = emitEvent(`dragGetChildDistance_${item.id}`, {
              dragX,
              dragY,
              moveId,
            })[0];

            if (res) {
              if (nowDrag.ly > res.ly) {
                nowDrag = res;
                nowDrag.id = item.id;
              } else if (nowDrag.ly === res.ly) {
                if (nowDrag.lx > res.lx || (nowDrag.lx === res.lx && nowDrag.lallx > res.lallx)) {
                  /* if (nowDrag.lx === res.lx && nowDrag.lallx > res.lallx) {
                    res.typex = res.typey
                  } */

                  nowDrag = res;
                  nowDrag.id = item.id;
                }
                // nowDrag.isX = true
              }
            }
          });

          toBlock.id = nowDrag.id;
          toBlock.type = nowDrag.typey;
          emitEvent(`dragAciveChild`, { id: nowDrag.id, type: nowDrag.typey }); // nowDrag.isX ? nowDrag.typex : nowDrag.typey
        } else {
          emitEvent(`dragAciveChild`, { id: '' });
        }
      } else {
        isToContainer.value = false;
      }
    },
    dragAdd: (component: Record<string, any>) => {
      if (isToContainer.value) {
        let index = childComponents?.value.length || 0;
        if (toBlock.id !== '' && toBlock.id !== undefined) {
          index = childComponents?.value.findIndex((t) => t.id === toBlock.id) || 0;
          if (toBlock.type === 'bottom') {
            index += 1;
          }
        }
        addComponent(component, myId, index, groupId);
        isToContainer.value = false;
      }

      removeMoving();
    },
    dragAddByClick: (component: Record<string, any>) => {
      if (
        (!activedComponent.value && myId === top.id) ||
        activedComponent.value?.id === myId ||
        (activedComponent.value?.containerId === myId &&
          activedComponent.value?.dragType !== 'container')
      ) {
        const index = childComponents?.value.length || 0;
        const newComponent = addComponent(component, myId, index, groupId, true);
        if (newComponent && component.config) {
          Object.keys(component.config).forEach((key) => {
            newComponent.config[key] = component.config[key];
          });
        }
      }
    },
    dragUpdate(id: string) {
      if (isToContainer.value) {
        const component = getComponent(id);
        component.level = myLevel + 1;

        if (toBlock.id !== component.id) {
          // 移除原来的位置
          removeComponentFromContainer(component.containerId, id);
          let index = childComponents?.value.findIndex((t) => t.id === toBlock.id) || 0;
          if (toBlock.type === 'bottom') {
            index += 1;
          }
          addComponentToContainer(component, myId, index, groupId);
        }

        isToContainer.value = false;
        nextTick(() => {
          emitEvent('dragClick', {
            id: component.id,
            isAgain: true,
          });
        });
      }

      removeMoving();
    },
  };

  // 事件组册和销毁
  const eventBusIds: Record<string, string> = {};
  onMounted(() => {
    if (!isComponentContainer || dragType !== 'container') {
      Object.keys(eventBus).forEach((key) => {
        eventBusIds[key] = onEvent(key, eventBus[key]);
      });
    }

    if (dragType === 'container') {
      Object.keys(eventContainerBus).forEach((key) => {
        eventBusIds[key] = onEvent(key, eventContainerBus[key]);
      });
    }

    if (componentData.isNewAdd) {
      nextTick(() => {
        activeComponent();
        delete componentData.isNewAdd;
      });
    }
  });

  onUnmounted(() => {
    Object.keys(eventBusIds).forEach((key) => {
      offEvent(key, eventBusIds[key]);
    });
  });

  return {
    onMouseenter,
    onMouseleave,
    activeComponent,
    handleComponentClick,
    deleteComponentByClick,
    copyComponent,
    getParentComponents,
    isBottomToolBar,
    isHover,
    isSelect,
    isToContainer,
    isMoveingInTopLevel,
    isTopActive,
    isBottomActive,
  };
};
