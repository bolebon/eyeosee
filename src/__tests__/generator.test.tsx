import React from "react";
import path from "path";
import fs from "fs/promises";
import { ContainerGenerator } from "../generator/container-generator";
import { Container } from "../core/container";
import { render, screen, waitFor } from "@testing-library/react";

const EYEOSEE_MODULE_PATH = path.resolve(__dirname, "..");
const DUMMY_SRC_DIR = path.resolve(__dirname, "./dummy-src");
const CONTAINER_PATH = path.resolve(DUMMY_SRC_DIR, "./container.ts");
const TS_CONFIG_PATH = path.resolve(__dirname, "../../tsconfig.json");

describe("Generator", () => {
  afterAll(async () => {
    await fs.rm(CONTAINER_PATH);
  });

  it("should generare the container file based on the source directory", async () => {
    const generator = new ContainerGenerator(
      [
        path.resolve(DUMMY_SRC_DIR, "./*.ts"),
        path.resolve(DUMMY_SRC_DIR, "./*.tsx"),
      ],
      [],
      TS_CONFIG_PATH,
      CONTAINER_PATH
    );

    await generator.generate(path.relative(DUMMY_SRC_DIR, EYEOSEE_MODULE_PATH));

    const containerFileContent = (await fs.readFile(CONTAINER_PATH)).toString();

    expect(containerFileContent).toEqual(
      expect.stringMatching(
        /export\s+type\s+ContainerDependencies\s*=\s*{\s*useDecoratedMessage:\s*ExtractedContainerItem<\s*typeof\s+useDecoratedMessage_(\d+)\s*>;\s*decorateMessage:\s*ExtractedContainerItem<\s*typeof\s+decorateMessage_(\d+)\s*>;\s*MessageDecorator:\s*ExtractedContainerItem<\s*typeof\s+default_(\d+)\s*>;\s*};\s*export\s+const\s+container\s*=\s*new\s+Container<\s*ContainerDependencies\s*>\(\s*\);/
      )
    );

    const { container, initContainer, ContainerInitializer } = await import(
      CONTAINER_PATH
    );

    expect(container).toBeInstanceOf(Container);
    expect(initContainer).toBeInstanceOf(Function);

    const { default: MessageDecorator } = await import(
      path.resolve(DUMMY_SRC_DIR, "./MessageDecorator.tsx")
    );

    render(
      <ContainerInitializer fallback={<>Initializing...</>}>
        <MessageDecorator message="Test generator" />
      </ContainerInitializer>
    );

    await waitFor(() => {
      expect(screen.getByText("** Test generator **")).toBeInTheDocument();
    });
  });
});
