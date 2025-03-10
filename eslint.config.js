import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import pluginPrettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,vue}'],
    plugins: {
      vue: await import('eslint-plugin-vue'),
      prettier: await import('eslint-plugin-prettier'),
    },
    languageOptions: {
      globals: {
        process: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 100,
          bracketSpacing: true,
          endOfLine: 'auto',
        },
      ],
      'vue/multi-word-component-names': 'warn',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/recommended'], // Cambia "essential" por "recommended" para mejores prácticas
  {
    name: 'Prettier',
    plugins: { prettier: pluginPrettier },
    rules: {
      ...configPrettier.rules, // Desactiva reglas de ESLint que entren en conflicto con Prettier
      'prettier/prettier': 'error', // Muestra errores de Prettier en ESLint
    },
  },
];
