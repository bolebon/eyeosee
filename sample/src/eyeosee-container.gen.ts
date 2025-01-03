import {
  Container,
  registerComponentFactory,
  registerHookFactory,
  registerFunctionFactory,
  ExtractedContainerItem,
} from "eyeosee";

import type default_0 from "./App";
import type { useAgeControl as useAgeControl_1 } from "./hooks/useAgeControl";
import type { redirect as redirect_2 } from "./helpers/navigation";

export type ContainerDependencies = {
  "@components/App": ExtractedContainerItem<typeof default_0>;
  "@hooks/useAgeControl": ExtractedContainerItem<typeof useAgeControl_1>;
  "@helpers/navigation/redirect": ExtractedContainerItem<typeof redirect_2>;
};

export const container = new Container<ContainerDependencies>();

export const registerComponent = registerComponentFactory(container);
export const registerHook = registerHookFactory(container);
export const registerFunction = registerFunctionFactory(container);

export const initContainer = async () => {
  await Promise.all([
    import("./App"),
    import("./hooks/useAgeControl"),
    import("./helpers/navigation"),
  ]);
};