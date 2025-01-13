/// <reference types="vitest/config" />
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      include: ["src/**/*"],
      exclude: [
        "src/__tests__/**/*",
        "src/generator/cli.ts",
        "src/generator/bundler.ts",
        "src/generator/defaults.const.ts",
      ],
    },
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        main: resolve(__dirname, "src/index.ts"),
      },
      name: "EyeOSee",
      // the proper extensions will be added
      fileName: "eyeosee",
      formats: ["es", "cjs", "umd", "iife"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "React",
        },
      },
    },
  },
});
