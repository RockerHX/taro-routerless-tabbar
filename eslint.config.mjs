import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

const tsFiles = ['**/*.{ts,tsx,mts,cts}']
const vueFiles = ['**/*.vue']
const tsRules = {
  'no-undef': 'off',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      args: 'none',
      ignoreRestSiblings: true,
    },
  ],
}

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'examples/taro-vue3-basic/dist/**',
      'examples/taro-vue3-basic/node_modules/**',
      'examples/*/.swc/**',
    ],
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: tsFiles,
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: tsRules,
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'vue/one-component-per-file': 'off',
    },
  },
  {
    files: vueFiles,
    languageOptions: {
      parser: vueParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tsRules,
      'vue/multi-word-component-names': 'off',
    },
  },
  eslintConfigPrettier,
]
