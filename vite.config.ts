import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const taroTemplateTags = new Set(['view', 'image', 'text'])

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement(tag) {
            return taroTemplateTags.has(tag)
          },
        },
      },
    }),
  ],
  build: {
    copyPublicDir: false,
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      cssFileName: 'style',
      fileName() {
        return 'index.js'
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@tarojs/taro', '@tarojs/components'],
    },
  },
})
