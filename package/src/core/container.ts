import React from "react";
import { useMemo } from "react";

export enum ContainerItemType {
  COMPONENT = "COMPONENT",
  FUNCTION = "FUNCTION",
  HOOK = "HOOK",
}

export type ContainerDependencies = { [key: string]: any };

export type DependencyList<CD extends ContainerDependencies> =
  readonly (keyof CD)[];

export type DependencySet<
  CD extends ContainerDependencies,
  K extends DependencyList<CD>,
> = Pick<CD, K[number]>;

export type ContainerItemMetadata<T extends ContainerItemType> = {
  __containerItemMetadata: {
    type: T;
    name: string;
  };
};

export type ComponentContainerItem<D, P extends {} = {}> = React.ComponentType<
  P & { __deps?: Partial<D> }
> &
  ContainerItemMetadata<ContainerItemType.COMPONENT>;

export type FunctionContainerItem<
  D,
  A extends any[] = any[],
  R extends any = any,
  T extends ContainerItemType = ContainerItemType.FUNCTION,
> = ((...args: [...A, deps?: Partial<D> | undefined]) => R) &
  ContainerItemMetadata<T>;

export type HookContainerItem<
  D,
  A extends any[] = any[],
> = FunctionContainerItem<D, A, ContainerItemType.HOOK>;

export type ContainerItem<CD extends ContainerDependencies> =
  | ComponentContainerItem<CD>
  | HookContainerItem<CD>
  | FunctionContainerItem<CD>;

export type ExtractedContainerItem<T> =
  T extends ComponentContainerItem<any, infer P>
    ? React.ComponentType<P>
    : T extends FunctionContainerItem<
          any,
          infer A,
          infer R,
          ContainerItemType.FUNCTION
        >
      ? (...args: A) => R
      : T extends FunctionContainerItem<
            any,
            infer A,
            infer R,
            ContainerItemType.HOOK
          >
        ? (...args: A) => R
        : never;

export class Container<CD extends ContainerDependencies> {
  private _items: {
    [K in keyof CD]?: ContainerItem<CD>;
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

  registerComponent<P extends {}, DL extends DependencyList<CD>>(
    name: keyof CD,
    dependencies: DL,
    component: React.ComponentType<P & { __deps: DependencySet<CD, DL> }>
  ) {
    const WrapperComponent: ComponentContainerItem<
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
      name: name as string,
    };

    this._items[name] = WrapperComponent as ContainerItem<CD>;

    return WrapperComponent;
  }

  registerFunction<
    A extends any[],
    R extends any,
    DL extends DependencyList<CD>,
  >(
    name: keyof CD,
    dependencies: DL,
    func: (...args: [...A, deps: DependencySet<CD, DL>]) => R,
    type: ContainerItemType = ContainerItemType.FUNCTION
  ) {
    type DS = DependencySet<CD, DL>;

    const WrapperFunction: FunctionContainerItem<DS, A, R, typeof type> = (
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

      console.log("registerFunction", {
        name,
        type,
        argsWithDeps,
        baseArgs,
        deps,
      });
      return func(...argsWithDeps);
    };

    WrapperFunction.__containerItemMetadata = {
      type,
      name: name as string,
    };

    this._items[name] = WrapperFunction as ContainerItem<CD>;

    return WrapperFunction;
  }

  get<N extends keyof CD>(name: N): ContainerItem<CD> | undefined {
    return this._items[name];
  }
}
