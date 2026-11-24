import { buildShortUUID } from '../utils/method';

const eventMap: Record<string, any> = {};

const on = (name: string, fn: any, buff: Record<string, any>) => {
  buff[name] = buff[name] || {};
  const id = buildShortUUID();
  buff[name][id] = fn;
  return id;
};
const emit = (name: string, data: any, buff: Record<string, any>) => {
  const res: any[] = [];
  const eventList: Record<string, any> = buff[name] || {};
  Object.keys(eventList).forEach((key) => {
    const fn = eventList[key];
    try {
      if (fn) {
        res.push(fn(data));
      }
    } catch (error) {
      console.error(error);
    }
  });
  return res;
};
const off = (name: string, id: string, buff: Record<string, any>) => {
  if (id) {
    const eventList = buff[name];
    if (eventList) {
      delete eventList[id];
    }
  } else {
    delete buff[name];
  }
};

const onEvent = (name: string, fn: any) => on(name, fn, eventMap);

const emitEvent = (name: string, data: any) => emit(name, data, eventMap);

const offEvent = (name: string, id: string) => {
  off(name, id, eventMap);
};

export { onEvent, emitEvent, offEvent };
