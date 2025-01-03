import { createUnplugin } from "unplugin";
import { ContainerGenerator } from "./container-generator";
import {
  DEFAULT_INCLUDED_FILES,
  DEFAULT_EXCLUDED_FILES,
  DEFAULT_CONTAINER_PATH,
} from "./defaults.const";

interface EyeOSeePluginOptions {
  includes?: string[];
  excludes?: string[];
  containerPath?: string;
}

const EyeOSeePlugin = createUnplugin<EyeOSeePluginOptions>(
  ({
    includes = DEFAULT_INCLUDED_FILES,
    excludes = DEFAULT_EXCLUDED_FILES,
    containerPath = DEFAULT_CONTAINER_PATH,
  } = {}) => {
    const generator = new ContainerGenerator(
      includes,
      excludes,
      containerPath
    );

    async function doGenerate() {
      console.log("⚙ Generating EyeOSee container...");
      await generator.generate();
      console.log(
        `✅ EyeOSee container generated: ${containerPath} !`
      );
    }

    return {
      name: "eyeosee-plugin",

      // Hook: Plugin initialization
      async buildStart() {
        await doGenerate();
      },

      // Hook: Called when files are updated
      async watchChange() {
        await doGenerate();
      },
    };
  }
);

export const eyeoseeVitePlugin = EyeOSeePlugin.vite;
export const eyeoseeWebpackPlugin = EyeOSeePlugin.webpack;
