import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const engineBoundaryMessage =
  'Import from "@/engines" instead - UI code shouldn\'t reach into engine internals directly (see .claude/docs/pending.md Phase 3).';

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
    // Generated test-coverage reports (nyc/istanbul output), not source.
    "coverage/**",
  ]),
  {
    // UI code goes through @/engines - src/app/dev/** (dev tooling that
    // deliberately inspects internals) and test files are exempt.
    files: ["src/app/**/*.{ts,tsx}", "src/chapters/**/*.{ts,tsx}", "src/canvas/**/*.{ts,tsx}"],
    ignores: ["src/app/dev/**", "**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/validation-engine", "@/validation-engine/*"], message: engineBoundaryMessage },
            { group: ["@/ai/run-deep-check", "@/ai/providers", "@/ai/providers/*"], message: engineBoundaryMessage },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
