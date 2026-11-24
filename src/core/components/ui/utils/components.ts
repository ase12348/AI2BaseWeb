import { type PropType, type Component, type Plugin, type App } from 'vue';

export const isArray = (val: unknown): val is Array<any> => Array.isArray(val);
export const camelize = (s: string): string =>
  s.replace(/-(\w)/g, (_: any, p: string) => p.toUpperCase());
export const bigCamelize = (s: string): string =>
  camelize(s).replace(s.charAt(0), s.charAt(0).toUpperCase());
export type ComponentWithInstall<T> = T & Plugin;
export function withInstall(
  target: Component,
  components: Component[] = [],
): ComponentWithInstall<Component> {
  const componentWithInstall = target;

  (componentWithInstall as ComponentWithInstall<Component>).install = function (app: App) {
    app.component(target.name ?? '', target);
    // eslint-disable-next-line no-restricted-syntax
    for (const component of components) {
      app.component(component.name ?? '', component);
    }
  };

  return componentWithInstall as ComponentWithInstall<Component>;
}

export type ClassName = string | undefined | null;
export type Classes = (ClassName | [any, ClassName, ClassName?])[];
export type BEM<
  S extends string | undefined,
  N extends string,
  NC extends string,
> = S extends undefined
  ? NC
  : S extends `$--${infer CM}`
    ? `${N}--${CM}`
    : S extends `--${infer M}`
      ? `${NC}--${M}`
      : `${NC}__${S}`;

export function createNamespace<C extends string>(name: C) {
  const namespace = `lr` as const;
  const componentName = `${namespace}-${name}` as const;

  const createBEM = <S extends string | undefined = undefined>(
    suffix?: S,
  ): BEM<S, typeof namespace, typeof componentName> => {
    if (!suffix) {
      return componentName as any;
    }

    if (suffix[0] === '$') {
      return suffix.replace('$', namespace) as any;
    }

    return (
      suffix.startsWith('--') ? `${componentName}${suffix}` : `${componentName}__${suffix}`
    ) as any;
  };

  const classes = (...classes: Classes): any[] =>
    classes.map((className) => {
      if (isArray(className)) {
        const [condition, truthy, falsy = null] = className;
        return condition ? truthy : falsy;
      }

      return className;
    });

  return {
    name: bigCamelize(componentName),
    n: createBEM,
    classes,
  };
}

export function call<P extends any[], R>(
  fn?: ((...arg: P) => R) | ((...arg: P) => R)[] | null,
  ...args: P
): R | R[] | undefined {
  if (isArray(fn)) {
    return fn.map((f) => f(...args));
  }

  if (fn) {
    return fn(...args);
  }
}

export function defineListenerProp<F>(fallback?: any) {
  return {
    type: [Function, Array] as PropType<F | F[]>,
    default: fallback,
  };
}
