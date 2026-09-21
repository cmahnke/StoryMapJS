import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "compiled/**",
            "test-results/**",
            "playwright-report/**",
            "public/**",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts", "tests/**/*.ts", "e2e/**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            // runtime console reporting (validation, deprecation notices) is a feature
            "no-console": "off",
            // loosen null-only comparisons to smart mode
            eqeqeq: ["error", "smart"],
            "no-var": "error",
            "prefer-const": "error",
            "no-cond-assign": "error",
            "no-useless-escape": "error",
            "no-useless-assignment": "error",
            "no-unused-expressions": "error",
            "@typescript-eslint/no-this-alias": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { args: "none", varsIgnorePattern: "^_" },
            ],
        },
    },
    {
        files: ["**/*.js", "**/*.mjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
);
