import React from "react";
import { describe, expect, it } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import { Container, ContainerItemType } from "../core/container";
import {
  registerComponentFactory,
  registerHookFactory,
  registerFunctionFactory,
  registerConfigFactory,
} from "../core/registration-helpers";

describe("Core", () => {
  const container = new Container<{
    CONFIG: { DECORATION: string };
    decorateMessage: (message: string) => string;
    useDecoratedMessage: (message: string) => string;
    MessageDecorator: React.ComponentType<{ message: string }>;
  }>();

  const registerConfig = registerConfigFactory(container);
  const registerComponent = registerComponentFactory(container);
  const registerHook = registerHookFactory(container);
  const registerFunction = registerFunctionFactory(container);

  const config = registerConfig("CONFIG", {
    DECORATION: "**",
  });
  const decorateMessage = registerFunction("decorateMessage", ["CONFIG"])<
    [message: string],
    string
  >((message, deps) => {
    return `${deps.CONFIG.DECORATION} ${message} ${deps.CONFIG.DECORATION}`;
  });
  const useDecoratedMessage = registerHook("useDecoratedMessage", [
    "decorateMessage",
  ])<[message: string], string>((message, deps) => {
    return deps.decorateMessage(message);
  });
  const MessageDecorator = registerComponent("MessageDecorator", [
    "useDecoratedMessage",
  ])<{ message: string }>(({ message, __deps }) => {
    const decoratedMessage = __deps.useDecoratedMessage(message);

    return <p>{decoratedMessage}</p>;
  });

  describe("#registerConfig", () => {
    it("should return the config with metadata", () => {
      expect(config).toEqual({
        DECORATION: "**",
        __containerItemMetadata: {
          name: "CONFIG",
          type: ContainerItemType.CONFIG,
        },
      });
    });
  });

  describe("#registerFunction", () => {
    it("should return a function with metadata", () => {
      expect(decorateMessage.__containerItemMetadata).toEqual({
        name: "decorateMessage",
        type: ContainerItemType.FUNCTION,
      });
    });
  });

  describe("#registerHook", () => {
    it("should return a hook with metadata", () => {
      expect(useDecoratedMessage.__containerItemMetadata).toEqual({
        name: "useDecoratedMessage",
        type: ContainerItemType.HOOK,
      });
    });
  });

  describe("#registerComponent", () => {
    it("should return a component with metadata", () => {
      expect(MessageDecorator.__containerItemMetadata).toEqual({
        name: "MessageDecorator",
        type: ContainerItemType.COMPONENT,
      });
    });
  });

  it("should inject dependencies in every items", () => {
    render(<MessageDecorator message="Hello, world!" />);

    expect(screen.getByText("** Hello, world! **")).toBeInTheDocument();
  });

  it("should allow to override dependencies", () => {
    render(
      <MessageDecorator
        message="Hello, world!"
        __deps={{
          useDecoratedMessage: (message) => {
            return `## ${message} ##`;
          },
        }}
      />
    );

    expect(screen.getByText("## Hello, world! ##")).toBeInTheDocument();

    const hook = renderHook(() =>
      useDecoratedMessage("Hello, world!", {
        decorateMessage: (message) => `%% ${message} %%`,
      })
    );

    expect(hook.result.current).toEqual("%% Hello, world! %%");
  });
});
