// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
// Note: storybook plugin available if needed: eslint-plugin-storybook

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Storybook build output
    "storybook-static/**",
  ]),
  // Custom rules
  {
    rules: {
      // Warn when importing from deprecated ui/ directory
      'no-restricted-imports': ['warn', {
        paths: [
          {
            name: '@/components/ui',
            message: 'Import from @/components/base or @/components/composed instead. The ui/ directory contains domain-specific components only.',
          },
        ],
        patterns: [
          {
            group: ['@/components/ui/*'],
            message: 'Import from @/components/base or @/components/composed instead. The ui/ directory contains domain-specific components only.',
          },
        ],
      }],
    },
  },
]);

export default eslintConfig;
