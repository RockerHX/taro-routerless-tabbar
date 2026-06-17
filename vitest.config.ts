import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const taroTemplateTags = new Set(['view', 'image', 'text'])

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => taroTemplateTags.has(tag),
        },
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
})
