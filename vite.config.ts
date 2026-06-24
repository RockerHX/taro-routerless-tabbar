import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const taroTemplateTags = new Set(['view', 'image', 'text'])
const libEntries = {
  index: path.resolve(__dirname, 'src/index.ts'),
  core: path.resolve(__dirname, 'src/core.ts'),
}

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
      entry: libEntries,
      cssFileName: 'style',
      fileName(_format, entryName) {
        return `${entryName}.js`
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@tarojs/taro', '@tarojs/components'],
    },
  },
})
