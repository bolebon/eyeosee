import React from "react";
import {
  ComponentContainerItem,
  Container,
  ContainerDependencies,
  ContainerItemType,
  DependencyList,
  DependencySet,
  FunctionContainerItem,
} from "./container";

export function registerComponentFactory<CD extends ContainerDependencies>(
  container: Container<CD>
) {
  return function registerComponentDependency<DL extends DependencyList<CD>>(
    name: string,
    dependencies: DL
  ) {
    return function registerComponent<P extends {} = {}>(
      component: React.ComponentType<P & { __deps: DependencySet<CD, DL> }>
    ) {
      return container.registerComponent<P, DL>(
        name,
        dependencies,
        component
      ) as ComponentContainerItem<DependencySet<CD, DL>, P>;
    };
  };
}

export function registerFunctionFactory<
  CD extends ContainerDependencies,
  T extends ContainerItemType = ContainerItemType.FUNCTION,
>(container: Container<CD>, type: T = ContainerItemType.FUNCTION as T) {
  return function registerFunctionDependency<DL extends DependencyList<CD>>(
    name: string,
    dependencies: DL
  ) {
    return function registerFunction<A extends any[], R = void>(
      func: (...args: [...A, DependencySet<CD, DL>]) => R
    ) {
      return container.registerFunction(
        name,
        dependencies,
        func,
        type
      ) as FunctionContainerItem<DependencySet<CD, DL>, A, R, T>;
    };
  };
}

export function registerHookFactory<CD extends ContainerDependencies>(
  container: Container<CD>
) {
  return registerFunctionFactory(container, ContainerItemType.HOOK);
}
