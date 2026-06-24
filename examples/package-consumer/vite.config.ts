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
})
