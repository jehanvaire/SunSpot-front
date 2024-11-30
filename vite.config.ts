/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/theme/mixins" as *;`,
        sassOptions: {
          outputStyle: 'compressed'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
