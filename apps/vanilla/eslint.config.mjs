import base from "../../eslint.config.mjs";

export default [
  ...base,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
      },
    },
  },
];
