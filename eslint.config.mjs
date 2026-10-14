import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default defineConfig(
  { ignores: ["dist/**", ".astro/**", ".verify/**", "node_modules/**", "supabase/functions/resend-email/email-template.ts"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node, Deno: "readonly" } },
    rules: {
      // Existing DOM assertions and SDK rows are migrated incrementally; runtime validation protects boundaries.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
);
