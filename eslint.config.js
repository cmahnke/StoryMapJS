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
            // legacy codebase pragmas
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-this-alias": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { args: "none", varsIgnorePattern: "^_" },
            ],
            "prefer-const": "off",
            "no-var": "off",
            eqeqeq: "off",
            "no-useless-escape": "off",
            "no-useless-assignment": "off",
            "no-cond-assign": "off",
            "no-console": "off",
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
