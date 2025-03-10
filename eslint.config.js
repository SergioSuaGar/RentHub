import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,vue}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/recommended"], // Cambia "essential" por "recommended" para mejores prácticas
  {
    name: "Prettier",
    plugins: { prettier: pluginPrettier },
    rules: {
      ...configPrettier.rules, // Desactiva reglas de ESLint que entren en conflicto con Prettier
      "prettier/prettier": "error", // Muestra errores de Prettier en ESLint
    },
  },
];
