import fs from "fs/promises";
import path from "path";

import { glob } from "glob";
import prettier from "prettier";
import partition from "lodash.partition";
import * as esbuildRegister from "esbuild-register/dist/node";

type Dependencies = [
  file: string,
  exports: { name: string; alias: string; dependencyName: string }[],
][];

export class ContainerGenerator {
  constructor(
    private includedFiles: string[],
    private excludedFiles: string[],
    private containerPath: string
  ) {}

  async generate() {
    const files = await glob(this.includedFiles, {
      ignore: this.excludedFiles,
      absolute: true,
    });
    const basePath = path.dirname(this.containerPath);

    const dependencies = await this._getDependenciesFromFiles(files);
    const containerFileContent = await this._generateContainerFileContent(
      basePath,
      dependencies
    );

    await fs.writeFile(this.containerPath, containerFileContent);
  }

  private async _generateContainerFileContent(
    basePath: string,
    dependencies: Dependencies
  ) {
    const containerFileContent = [];

    // Import the container
    containerFileContent.push(`
      import {
        Container,
        registerComponentFactory,
        registerHookFactory,
        registerFunctionFactory,
      } from "eyeosee";
    `);

    // TODO: Add imports from dependencies
    dependencies.forEach(([file, exports]) => {
      if (exports.length === 0) {
        return;
      }
      const [defaultExports, namedExports] = partition(
        exports,
        ({ name }) => name === "default"
      );
      const importsList = [];
      if (defaultExports.length > 0) {
        const { alias } = defaultExports[0];
        importsList.push(alias);
      }
      if (namedExports.length > 0) {
        importsList.push(
          `{ ${namedExports.map((exp) => `${exp.name} as ${exp.alias}`).join(", ")} }`
        );
      }
      containerFileContent.push(
        `import type ${importsList.join(", ")} from "./${path.relative(basePath, file)}";`
      );
    });

    // Generate the Container depdendencies map
    containerFileContent.push(`
      export type ContainerDependencies = {
    `);
    dependencies.forEach(([_, exports]) => {
      exports.forEach(({ alias, dependencyName }) => {
        containerFileContent.push(
          `${JSON.stringify(dependencyName)}: typeof ${alias},`
        );
      });
    });
    containerFileContent.push("};");

    containerFileContent.push(`

      export const container = new Container<ContainerDependencies>();

      export const registerComponent = registerComponentFactory(container);
      export const registerHook = registerHookFactory(container);
      export const registerFunction = registerFunctionFactory(container);

      const initContainer = async () => {
        await Promise.all([
          ${dependencies.map(([file]) => `import("./${path.relative(basePath, file)}")`).join(",\n")}
        ]);
      });
    `);

    const content = await prettier.format(containerFileContent.join("\n"), {
      parser: "typescript",
    });

    return content;
  }

  private async _getDependenciesFromFiles(
    files: string[]
  ): Promise<Dependencies> {
    let increment = 0;
    const getId = () => increment++;

    esbuildRegister.register({
      extensions: [".ts", ".tsx"],
    });
    const dependencies: Dependencies = await Promise.all(
      files.map(async (file) => {
        const fileWithoutExtension = file.split(".").slice(0, -1).join(".");
        try {
          const exports: Record<string, any> = await import(file);
          const elligibleExports = Object.entries(exports).flatMap(
            ([key, value]) =>
              value.__containerItemMetadata !== undefined
                ? [
                    {
                      name: key,
                      alias: `${key}_${getId()}`,
                      dependencyName: value.__containerItemMetadata.name,
                    },
                  ]
                : []
          );
          return [fileWithoutExtension, elligibleExports];
        } catch (e) {
          return [fileWithoutExtension, []];
        }
      })
    );

    return dependencies;
  }
}
