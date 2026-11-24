import type { Ref } from 'vue';
import type { Options } from 'sortablejs';
import { nextTick, unref } from 'vue';
import Sortable from 'sortablejs';

export function useSortable(el?: HTMLElement | Ref<HTMLElement | undefined>, options?: Options) {
  function initSortable() {
    nextTick(() => {
      el = unref(el);
      if (!el) return;
      Sortable.create(el, {
        animation: 100,
        delay: 400,
        delayOnTouchOnly: true,
        ...options,
      });
    });
  }

  return { initSortable };
}
