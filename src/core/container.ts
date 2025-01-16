import React from "react";
import { useMemo } from "react";

export enum ContainerItemType {
  CONFIG = "CONFIG",
  COMPONENT = "COMPONENT",
  FUNCTION = "FUNCTION",
  HOOK = "HOOK",
}

export type ContainerDependencies = { [key: string]: any };

export type DependencyList<CD extends ContainerDependencies> = readonly Extract<
  keyof CD,
  string
>[];

export type DependencySet<
  CD extends ContainerDependencies,
  K extends DependencyList<CD>,
> = Pick<CD, K[number]>;

export type ContainerItemMetadata<
  N extends string,
  T extends ContainerItemType,
> = {
  __containerItemMetadata: {
    type: T;
    name: N;
  };
};

export type ComponentContainerItem<
  N extends string,
  D,
  P extends {} = {},
> = React.ComponentType<P & { __deps?: Partial<D> }> &
  ContainerItemMetadata<N, ContainerItemType.COMPONENT>;

export type FunctionContainerItem<
  N extends string,
  D,
  A extends any[] = any[],
  R extends any = any,
  T extends ContainerItemType = ContainerItemType.FUNCTION,
> = ((...args: [...A, deps?: Partial<D> | undefined]) => R) &
  ContainerItemMetadata<N, T>;

export type HookContainerItem<
  N extends string,
  D,
  A extends any[] = any[],
  R extends any = any,
> = FunctionContainerItem<N, D, A, R, ContainerItemType.HOOK>;

export type ConfigContainerItem<
  N extends string,
  C extends Record<string, any> = Record<string, any>,
> = C & ContainerItemMetadata<N, ContainerItemType.CONFIG>;

export type ContainerItem<N extends string, CD extends ContainerDependencies> =
  | ComponentContainerItem<N, CD>
  | HookContainerItem<N, CD>
  | FunctionContainerItem<N, CD>
  | ConfigContainerItem<N>;

export type ExtractedContainerItem<T> =
  T extends ComponentContainerItem<string, any, infer P>
    ? React.ComponentType<P>
    : T extends FunctionContainerItem<
          string,
          any,
          infer A,
          infer R,
          ContainerItemType.FUNCTION
        >
      ? (...args: A) => R
      : T extends FunctionContainerItem<
            string,
            any,
            infer A,
            infer R,
            ContainerItemType.HOOK
          >
        ? (...args: A) => R
        : T extends ConfigContainerItem<string, infer C>
          ? C
          : never;

export class Container<CD extends ContainerDependencies> {
  private _items: {
    [name: string]: ContainerItem<string, CD> | undefined;
  } = {};

  private _buildDependencies<K extends DependencyList<CD>>(
    dependencies: K,
    overrides: Partial<DependencySet<CD, K>> = {}
  ): DependencySet<CD, K> {
    return dependencies.reduce(
      (acc, key) => {
        const dep = (overrides[key] ?? this.get(key)) as
          | DependencySet<CD, K>[typeof key]
          | undefined;
        if (dep !== undefined) {
          acc[key] = dep;
        }
        return acc;
      },
      {} as DependencySet<CD, K>
    );
  }

  registerComponent<
    N extends string,
    P extends {},
    DL extends DependencyList<CD>,
  >(
    name: N,
    dependencies: DL,
    component: React.ComponentType<P & { __deps: DependencySet<CD, DL> }>
  ) {
    const WrapperComponent: ComponentContainerItem<
      N,
      DependencySet<CD, DL>,
      P
    > = ({ __deps = {}, ...props }) => {
      const propsWithDeps = useMemo(
        () => ({
          ...props,
          __deps: this._buildDependencies(dependencies, __deps),
        }),
        [...Object.values(props), ...Object.values(__deps)]
      );
      return React.createElement(
        component,
        propsWithDeps as unknown as P & {
          __deps: DependencySet<CD, typeof dependencies>;
        }
      );
    };

    WrapperComponent.displayName = `EyeOSee(${
      component.displayName || component.name || "Component"
    })`;
    WrapperComponent.__containerItemMetadata = {
      type: ContainerItemType.COMPONENT,
      name: name,
    };

    this._items[name] = WrapperComponent as ContainerItem<N, CD>;

    return WrapperComponent;
  }

  registerFunction<
    N extends string,
    A extends any[],
    R extends any,
    DL extends DependencyList<CD>,
  >(
    name: N,
    dependencies: DL,
    func: (...args: [...A, deps: DependencySet<CD, DL>]) => R,
    type: ContainerItemType = ContainerItemType.FUNCTION
  ) {
    type DS = DependencySet<CD, DL>;

    const WrapperFunction: FunctionContainerItem<N, DS, A, R, typeof type> = (
      ...args: [...A, deps?: Partial<DS> | undefined]
    ) => {
      const hasDeps = dependencies.length > 0;
      const baseArgsCount = hasDeps ? func.length - 1 : func.length;
      const baseArgs = args.slice(0, baseArgsCount) as A;
      const deps: Partial<DS> | undefined = hasDeps
        ? args[func.length - 1]
        : undefined;
      const argsWithDeps: [...A, DS] = [
        ...baseArgs,
        this._buildDependencies(dependencies, deps),
      ];

      return func(...argsWithDeps);
    };

    WrapperFunction.__containerItemMetadata = {
      type,
      name,
    };

    this._items[name] = WrapperFunction as ContainerItem<N, CD>;

    return WrapperFunction;
  }

  registerConfig<N extends string, C extends Record<any, string>>(
    name: N,
    config: C
  ) {
    const configItem: ConfigContainerItem<N, C> = {
      ...config,
      __containerItemMetadata: {
        name,
        type: ContainerItemType.CONFIG,
      },
    };

    this._items[name] = configItem;
    return configItem;
  }

  get<N extends Extract<keyof CD, string>>(
    name: N
  ): ContainerItem<N, CD> | undefined {
    return this._items[name] as ContainerItem<N, CD>;
  }
}
