import { toRaw } from 'vue';

import { createLocalStorage, createSessionStorage } from '/@/core/utils/cache';
import { getStorageShortName } from '/@/core/utils/env';
import { Memory } from './memory';

import {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_EXPIRES_KEY,
  REFRESH_TOKEN_EXPIRES_KEY,
  MULTIPLE_TABS_KEY,
  APP_LOCAL_CACHE_KEY,
  APP_SESSION_CACHE_KEY,
  APP_THEME_KEY,
  APP_MENU_TYPE_KEY,
  LOCALE_TYPE_KEY,
  LOCALE_POST_KEY,
} from '/@/core/enums/cacheEnum';

interface BasicStore {
  [TOKEN_KEY]: string | number | null | undefined;
  [REFRESH_TOKEN_KEY]: string | null | undefined;
  [TOKEN_EXPIRES_KEY]: number | null | undefined;
  [REFRESH_TOKEN_EXPIRES_KEY]: number | null | undefined;
  [MULTIPLE_TABS_KEY]: any[];
  [APP_THEME_KEY]: string;
  [APP_MENU_TYPE_KEY]: string;
  [LOCALE_TYPE_KEY]: string;
  [LOCALE_POST_KEY]: string;
}

type LocalStore = BasicStore;

type SessionStore = BasicStore;

export type BasicKeys = keyof BasicStore;
type LocalKeys = keyof LocalStore;
type SessionKeys = keyof SessionStore;

const ls = createLocalStorage();
const ss = createSessionStorage();

const localMemory = new Memory();
const sessionMemory = new Memory();

function initPersistentMemory() {
  const localCache = ls.get(APP_LOCAL_CACHE_KEY);
  const sessionCache = ss.get(APP_SESSION_CACHE_KEY);
  localCache && localMemory.resetCache(localCache);
  sessionCache && sessionMemory.resetCache(sessionCache);
}

export class Persistent {
  static getLocal<T>(key: LocalKeys) {
    return localMemory.get(key)?.value as Nullable<T>;
  }

  static setLocal(key: LocalKeys, value: LocalStore[LocalKeys]): void {
    const localCache = ls.get(APP_LOCAL_CACHE_KEY);
    localCache && localMemory.resetCache(localCache);

    localMemory.set(key, toRaw(value));
    ls.set(APP_LOCAL_CACHE_KEY, localMemory.getCache);
  }

  static removeLocal(key: LocalKeys): void {
    localMemory.remove(key);
    ls.set(APP_LOCAL_CACHE_KEY, localMemory.getCache);
  }

  /**
   * 其他标签页写入 localStorage 后，把本标签页的内存缓存重新对齐。
   * 注意：getLocal 读的是内存缓存，不主动对齐会一直拿到旧值（令牌轮换时尤其致命）。
   */
  static reloadLocal(): void {
    const localCache = ls.get(APP_LOCAL_CACHE_KEY);
    localMemory.clear();
    localCache && localMemory.resetCache(localCache);
  }

  /** localStorage 中承载本地缓存的真实键名（带前缀、大写），供 storage 事件匹配 */
  static getLocalStorageKey(): string {
    return `${getStorageShortName()}${APP_LOCAL_CACHE_KEY}`.toUpperCase();
  }

  static clearLocal(): void {
    localMemory.clear();
    ls.clear();
  }

  static getSession<T>(key: SessionKeys) {
    return sessionMemory.get(key)?.value as Nullable<T>;
  }

  static setSession(key: SessionKeys, value: SessionStore[SessionKeys]): void {
    sessionMemory.set(key, toRaw(value));
    ss.set(APP_SESSION_CACHE_KEY, sessionMemory.getCache);
  }

  static removeSession(key: SessionKeys): void {
    sessionMemory.remove(key);
    ss.set(APP_SESSION_CACHE_KEY, sessionMemory.getCache);
  }
  static clearSession(): void {
    sessionMemory.clear();
    ss.clear();
  }

  static clearAll() {
    sessionMemory.clear();
    localMemory.clear();
    ls.clear();
    ss.clear();
  }
}

initPersistentMemory();
