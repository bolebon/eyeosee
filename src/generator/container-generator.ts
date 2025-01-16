import fs from "fs/promises";
import { constants } from "fs";
import path from "path";

import { glob } from "glob";
import prettier from "prettier";
import partition from "lodash.partition";
import { Project } from "ts-morph";

type Dependencies = [
  file: string,
  exports: { name: string; alias: string; dependencyName: string }[],
][];

export class ContainerGenerator {
  constructor(
    private includedFiles: string[],
    private excludedFiles: string[],
    private tsConfigFilePath: string,
    private containerPath: string
  ) {}

  async generate(eyeoseeModuleName = 'eyeosee') {
    // We create an "empty" container so it generates the factory functions
    // used by dependencies
    /* v8 ignore next 3 */
    try {
      await fs.access(this.containerPath, constants.F_OK);
    }
    catch {
      await this.__createContainerFile(eyeoseeModuleName, this.containerPath, []);
    }

    const files = await glob(this.includedFiles, {
      ignore: this.excludedFiles,
      absolute: true,
    });
    
    const dependencies = await this._getDependenciesFromFiles(
      files,
      this.tsConfigFilePath
    );

    await this.__createContainerFile(eyeoseeModuleName, this.containerPath, dependencies);
  }

  private async __createContainerFile(
    eyeoseeModuleName: string,
    containerPath: string,
    dependencies: Dependencies
  ) {
    const basePath = path.dirname(this.containerPath);

    const containerFileContent = await this._generateContainerFileContent(
      eyeoseeModuleName,
      basePath,
      dependencies
    );

    await fs.writeFile(containerPath, containerFileContent);
  }

  private async _generateContainerFileContent(
    eyeoseeModuleName: string,
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
        registerConfigFactory,
        containerInitializerFactory,
        ExtractedContainerItem,
      } from "${eyeoseeModuleName}";
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
          `${JSON.stringify(dependencyName)}: ExtractedContainerItem<typeof ${alias}>;`
        );
      });
    });
    containerFileContent.push("};");

    containerFileContent.push(`

      export const container = new Container<ContainerDependencies>();

      export const registerComponent = registerComponentFactory(container);
      export const registerHook = registerHookFactory(container);
      export const registerFunction = registerFunctionFactory(container);
      export const registerConfig = registerConfigFactory(container);

      export const initContainer = async () => {
        await Promise.all([
          ${dependencies
            .filter(([_, exports]) => exports.length > 0)
            .map(([file]) => `import("./${path.relative(basePath, file)}")`)
            .join(",\n")}
        ]);
      };

      export const ContainerInitializer = containerInitializerFactory(initContainer);
    `);

    const content = await prettier.format(containerFileContent.join("\n"), {
      parser: "typescript",
    });

    return content;
  }

  private async _getDependenciesFromFiles(
    files: string[],
    tsConfigFilePath: string
  ): Promise<Dependencies> {
    let increment = 0;
    const getId = () => increment++;

    const project = new Project({
      tsConfigFilePath,
    });

    const dependencies: Dependencies = await Promise.all(
      files.map(async (filePath) => {
        const filePathWithoutExtension = filePath
          .split(".")
          .slice(0, -1)
          .join(".");
        const file = project.getSourceFileOrThrow(filePath);
        const exports = file.getExportedDeclarations();
        const elligibleExports = Array.from(exports.entries()).flatMap(
          ([key, declarations]) => {
            const type = declarations[0].getType();
            const containerMetadata = type.getProperty(
              "__containerItemMetadata"
            );

            if (!containerMetadata) {
              return [];
            }
            const dependencyName = type
              .getAliasTypeArguments()[0]
              ?.getLiteralValue()
              ?.toString();

            /* v8 ignore next 3 */
            if (!dependencyName) {
              return [];
            }

            return [
              {
                name: key,
                alias: `${key}_${getId()}`,
                dependencyName,
              },
            ];
          }
        );
        return [filePathWithoutExtension, elligibleExports];
      })
    );

    return dependencies;
  }
}
