import { EncryptionFactory } from '@/core/utils/jcode';
import { getStorageShortName } from '/@/core/utils/env';
import { useGlobSetting } from '/@/core/hooks/setting';

const { options: webCofing } = useGlobSetting();

export interface CreateStorageParams {
  prefixKey: string;
  storage: Storage;
  hasEncrypt: boolean;
}
// TODO 移除此文件夹下全部代码
export const createStorage = ({
  prefixKey = getStorageShortName(),
  storage = sessionStorage,
  hasEncrypt = false,
}: Partial<CreateStorageParams> = {}) => {
  const persistEncryption: any = EncryptionFactory.createAesEncryption({
    key: webCofing.cache.key,
    iv: webCofing.cache.iv,
  });
  /**
   * Cache class
   * Construction parameters can be passed into sessionStorage, localStorage,
   * @class Cache
   * @example
   */
  const WebStorage = class WebStorage {
    private storage: Storage;
    private prefixKey?: string;
    private encryption: any;
    private hasEncrypt: boolean;
    /**
     *
     * @param {*} storage
     */
    constructor() {
      this.storage = storage;
      this.prefixKey = prefixKey;
      this.encryption = persistEncryption;
      this.hasEncrypt = hasEncrypt;
    }

    private getKey(key: string) {
      return `${this.prefixKey}${key}`.toUpperCase();
    }

    /**
     * Set cache
     * @param {string} key
     * @param {*} value
     * @param {*} expire Expiration time in seconds
     * @memberof Cache
     */
    set(key: string, value: any) {
      const stringData = JSON.stringify({
        value,
        time: Date.now(),
      });
      const stringifyValue = this.hasEncrypt ? this.encryption.encrypt(stringData) : stringData;
      this.storage.setItem(this.getKey(key), stringifyValue);
    }

    /**
     * Read cache
     * @param {string} key
     * @param {*} def
     * @memberof Cache
     */
    get(key: string, def: any = null): any {
      const val = this.storage.getItem(this.getKey(key));
      if (!val) return def;

      try {
        const decVal = this.hasEncrypt ? this.encryption.decrypt(val) : val;
        const data = JSON.parse(decVal);
        const { value } = data;
        return value;
      } catch (e) {
        return def;
      }
    }

    /**
     * Delete cache based on key
     * @param {string} key
     * @memberof Cache
     */
    remove(key: string) {
      this.storage.removeItem(this.getKey(key));
    }

    /**
     * Delete all caches of this instance
     */
    clear(): void {
      this.storage.clear();
    }
  };
  return new WebStorage();
};
