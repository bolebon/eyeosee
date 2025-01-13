import path from "path";
import { createUnplugin } from "unplugin";
import micromatch from "micromatch";
import { ContainerGenerator } from "./container-generator";
import {
  DEFAULT_CONTAINER_NAME,
  DEFAULT_INCLUDED_FILES,
  DEFAULT_EXCLUDED_FILES,
  DEFAULT_CONTAINER_PATH,
  DEFAULT_TSCONFIG_PATH,
} from "./defaults.const";

interface EyeOSeePluginOptions {
  name?: string;
  includes?: string[];
  excludes?: string[];
  tsConfigPath?: string;
  containerPath?: string;
}

const EyeOSeePlugin = createUnplugin<EyeOSeePluginOptions>(
  ({
    name = DEFAULT_CONTAINER_NAME,
    includes = DEFAULT_INCLUDED_FILES,
    excludes = DEFAULT_EXCLUDED_FILES,
    tsConfigPath = DEFAULT_TSCONFIG_PATH,
    containerPath = DEFAULT_CONTAINER_PATH,
  } = {}) => {
    const generator = new ContainerGenerator(
      includes,
      excludes,
      tsConfigPath,
      containerPath
    );

    async function doGenerate() {
      console.log(`⚙ Generating ${name} EyeOSee container...`);
      await generator.generate();
      console.log(`✅ ${name} EyeOSee container generated: ${containerPath} !`);
    }

    function isIncluded(path: string) {
      return (
        includes.some((i) => micromatch.isMatch(path, i)) &&
        !excludes.some((e) => micromatch.isMatch(path, e))
      );
    }

    return {
      name: "eyeosee-plugin",

      // Hook: Plugin initialization
      async buildStart() {
        await doGenerate();
      },

      // Hook: Called when files are updated
      async watchChange(id: string) {
        const relativePath = path.relative(".", id);
        const isContainer = id == path.resolve(containerPath);

        if (!isContainer && isIncluded(relativePath)) {
          await doGenerate();
        }
      },
    };
  }
);

export const eyeoseeVitePlugin = EyeOSeePlugin.vite;
export const eyeoseeWebpackPlugin = EyeOSeePlugin.webpack;
