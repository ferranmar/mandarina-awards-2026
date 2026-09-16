import eslint from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import typescriptEslint from "typescript-eslint";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  { ignores: ["*.d.ts", "**/coverage", "**/dist"] },
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      // Add custom rules here
    },
  },
);
