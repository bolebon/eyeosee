import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { eyeoseeVitePlugin } from 'eyeosee/bundler'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // eyeoseeVitePlugin({
    //   includes: ['src/**/*.ts'],
    // })
  ],
})
