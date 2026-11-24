import { PropType } from 'vue';

export function objectType<T = object>(defaultVal?: T) {
  return { type: Object as PropType<T>, default: defaultVal as T };
}
