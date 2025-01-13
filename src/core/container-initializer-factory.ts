import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from "react";
export function containerInitializerFactory(initFn: () => Promise<void>) {
  const ContainerInitializer: React.FC<
    PropsWithChildren<{ fallback: ReactNode }>
  > = ({ children, fallback }) => {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
      initFn().then(() => setInitialized(true));
    }, []);

    return initialized ? children : fallback;
  };

  return ContainerInitializer;
}
