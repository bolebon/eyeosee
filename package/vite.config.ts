import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        main: resolve(__dirname, 'src/index.ts'),
        // plugin: resolve(__dirname, 'src/bundler/plugin.ts'),
      },
      name: 'EyeOSee',
      // the proper extensions will be added
      fileName: 'eyeosee',
      formats: ['es', 'cjs', 'umd', 'iife'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'React',
        },
      },
    },
  },
})