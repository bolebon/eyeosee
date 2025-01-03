#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { ContainerGenerator } from "./container-generator";
import { DEFAULT_CONTAINER_PATH, DEFAULT_EXCLUDED_FILES, DEFAULT_INCLUDED_FILES } from "./defaults.const";

yargs(hideBin(process.argv))
  .command(
    "generate [includedFiles] [containerPath]",
    "generates the container file",
    (yargs) => {
      return yargs
        .option("includedFiles", {
          describe: "Files to create the container from",
          default: DEFAULT_INCLUDED_FILES,
          type: "array",
        })
        .option("excludedFiles", {
          describe: "Files to create the container from",
          default: DEFAULT_EXCLUDED_FILES,
          type: "array",
        })
        .option("containerPath", {
          describe: "Path to the container file",
          default: DEFAULT_CONTAINER_PATH,
          type: "string",
        });
    },
    async (argv) => {
      const generator = new ContainerGenerator(
        argv.includedFiles.map((x) => x.toString()),
        argv.excludedFiles.map((x) => x.toString()),
        argv.containerPath
      );

      await generator.generate();
      console.log(
        `✅ EyeOSee container generated: ${argv.containerPath} !`
      );
    }
  )
  .parse();
