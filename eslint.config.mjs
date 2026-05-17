import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.svelte-kit/**",
      "**/.angular/**",
      "**/coverage/**",
      "**/*.ts",
      "**/*.tsx",
      "**/*.vue",
      "**/*.svelte",
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
      },
    },
  },
  prettier,
];
