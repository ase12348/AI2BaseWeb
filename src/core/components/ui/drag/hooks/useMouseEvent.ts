import { ref } from 'vue';
import { emitEvent } from '../eventBus';
import { buildShortUUID } from '../../utils/method';

export const useMouseEvent = (component: Record<string, any>, isTool: boolean) => {
  const move = {
    x: 0,
    y: 0,
    pageX: 0,
    pageY: 0,
    dragElement: null as any,
    dragElementId: 'jcode-darg-move-id',
    toContainerLevel: -1,
    toContainerId: '',
    groupId: '',
    id: '',
  };

  let flag = false;
  const throttle = (fn: any, time: number) => {
    if (flag === true) {
      return;
    }
    flag = true;
    setTimeout(() => {
      fn();
      flag = false;
    }, time);
  };

  const moveActive = ref(false);

  const createDragElement = (name: string, top: number, left: number) => {
    // 创建一个移动块
    const div = document.createElement('div');
    div.id = move.dragElementId;
    div.innerText = name;
    div.className = 'lr-drag-move';
    div.style.top = `${top}px`;
    div.style.left = `${left}px`;
    document.body.appendChild(div);

    return div;
  };

  const stopMove = () => {
    document.onmousemove = null;
    document.onmouseup = null;
    moveActive.value = false;

    emitEvent(`dragAciveChild`, { id: '' });
  };

  const onMouseup = () => {
    stopMove();
    if (move.dragElement) {
      move.dragElement.remove();
      move.dragElement = null;

      if (isTool) {
        emitEvent('dragAdd', component);
      } else {
        emitEvent('dragUpdate', component.id);
      }
    }
  };

  const onMousemove = (e: MouseEvent) => {
    const { pageY, pageX } = e;
    if (!move.dragElement) {
      // console.log(pageX, pageY, move.x, move.y)
      const x = Math.abs(move.x - pageX);
      const y = Math.abs(move.y - pageY);

      if (x <= 2 && y <= 2) {
        // 防抖动
        return;
      }
      moveActive.value = true;
      move.dragElement = createDragElement(component.name, pageY - 11, pageX - 32);
    }
    move.dragElement.style.top = `${pageY - 11}px`;
    move.dragElement.style.left = `${pageX - 32}px`;
    move.pageX = pageX;
    move.pageY = pageY;

    throttle(() => {
      if (!moveActive.value) {
        return;
      }

      // 判断在哪一个容器中
      const res = emitEvent('isInContainer', {
        x: move.pageX,
        y: move.pageY,
        id: component.id,
        moveId: move.id,
      });

      move.toContainerLevel = -1;
      move.toContainerId = '';
      move.groupId = '';

      res.forEach(({ level, id, isIn, groupId }) => {
        if (isIn) {
          if (move.toContainerLevel < level) {
            move.toContainerLevel = level;
            move.toContainerId = id;
            move.groupId = groupId;
          }
        }
      });

      if (move.toContainerId !== '') {
        emitEvent('dragActiveContainer', {
          containerId: move.toContainerId,
          containerGroupId: move.groupId,
          dragX: move.pageX,
          dragY: move.pageY,
          moveId: move.id,
        });
      } else {
        emitEvent(`dragAciveChild`, { id: '' });
      }
    }, 100);
  };

  const onContextmenu = () => {
    // console.log('onContextmenu')
    stopMove();
  };

  const onMousedown = (e: MouseEvent) => {
    move.x = e.pageX;
    move.y = e.pageY;
    move.id = buildShortUUID();

    document.onmouseup = onMouseup;
    document.onmousemove = onMousemove;
  };

  const onClick = () => {
    emitEvent('dragAddByClick', component);
  };

  return {
    onContextmenu,
    onMousedown,
    onClick,
    moveActive,
  };
};
