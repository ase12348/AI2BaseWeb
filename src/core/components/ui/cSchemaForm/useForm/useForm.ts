import type { Ref } from 'vue';
import { unref, computed } from 'vue';
import { validateRules } from './validateUtil';

export interface Props {
  [key: string]: any;
}

type namesType = string | string[];

function getPropByPath(obj: Props, path: string) {
  return {
    o: obj,
    k: path,
    v: obj ? obj[path] : null,
  };
}

function useForm(
  modelRef: Props | Ref<Props>,
  rulesRef: Props | Ref<Props>,
): {
  validate: (names?: namesType) => Promise<Record<string, any>>;
  validateField: (name: string, value: any, rules: Record<string, unknown>[]) => Promise<any>;
} {
  const rulesKeys = computed(() => (rulesRef ? Object.keys(unref(rulesRef)) : []));
  const validateFields = (names: string[]) => {
    const values: Record<string, any> = {};
    const modelUnref = unref(modelRef);
    const rulesUnref = unref(rulesRef);
    const promises: any[] = [];
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const prop = getPropByPath(modelUnref, name);
      values[name] = prop.v;
      const rules = rulesUnref[name] || [];
      if (rules.length) {
        const res = validateField(name, prop.v, rules);
        promises.push(res);
      }
    }
    return Promise.all(promises);
  };
  const validateField = (name: string, value: any, rules: Record<string, unknown>[]) =>
    validateRules(name, value, rules);

  const validate = async (names?: namesType) => {
    let keys = [];
    if (!names) {
      keys = rulesKeys.value;
    } else if (Array.isArray(names)) {
      keys = names;
    } else {
      keys = [names];
    }

    const validateRes = (await validateFields(keys)) || [];

    const res: Record<string, any> = {};
    validateRes.forEach((item) => {
      if (item) {
        res[item.name] = { msg: item.errors };
      }
    });
    return res;
  };

  return {
    validate,
    validateField,
  };
}

export default useForm;
