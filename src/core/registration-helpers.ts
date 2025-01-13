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
  return function registerComponentDependency<
    N extends string,
    DL extends DependencyList<CD>,
  >(name: N, dependencies: DL) {
    return function registerComponent<P extends {} = {}>(
      component: React.ComponentType<P & { __deps: DependencySet<CD, DL> }>
    ) {
      return container.registerComponent<N, P, DL>(
        name,
        dependencies,
        component
      ) as ComponentContainerItem<N, DependencySet<CD, DL>, P>;
    };
  };
}

export function registerFunctionFactory<
  CD extends ContainerDependencies,
  T extends ContainerItemType = ContainerItemType.FUNCTION,
>(container: Container<CD>, type: T = ContainerItemType.FUNCTION as T) {
  return function registerFunctionDependency<
    N extends string,
    DL extends DependencyList<CD>,
  >(name: N, dependencies: DL) {
    return function registerFunction<A extends any[], R = void>(
      func: (...args: [...A, DependencySet<CD, DL>]) => R
    ) {
      return container.registerFunction(
        name,
        dependencies,
        func,
        type
      ) as FunctionContainerItem<N, DependencySet<CD, DL>, A, R, T>;
    };
  };
}

export function registerHookFactory<CD extends ContainerDependencies>(
  container: Container<CD>
) {
  return registerFunctionFactory(container, ContainerItemType.HOOK);
}
