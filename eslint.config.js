import globals from 'globals'
import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import jsoncParser from 'jsonc-eslint-parser'
import jsoncPlugin from 'eslint-plugin-jsonc'

export default [
  pluginJs.configs.recommended,
  {
    files: ['**/*.json'],
    languageOptions: { parser: jsoncParser },
    plugins: { jsonc: jsoncPlugin },
    rules: {
      ...jsoncPlugin.configs['recommended-with-json'].rules,
      ...jsoncPlugin.configs['recommended-with-jsonc'].rules,
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest, // add all jest globals
      },
    },
  },
  {
    files: ['**/*.js'],
    ...stylistic.configs.recommended,
  },
  {
    ignores: ['dist/', 'package.json', 'package-lock.json'],
  },
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]
