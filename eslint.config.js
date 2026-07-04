import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import svelte from "eslint-plugin-svelte";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import globals from "globals";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";

import svelteConfig from "./svelte.config.js";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  perfectionist.configs["recommended-natural"],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },

    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
        },
      ],
      curly: "error",
      "no-undef": "off",
      "no-unused-vars": "off",
      "perfectionist/sort-modules": "off",
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],

    languageOptions: {
      parserOptions: {
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        projectService: true,
        svelteConfig,
      },
    },
  },
);
