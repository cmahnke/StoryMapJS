import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
        // Playwright owns the browser specs
        exclude: ["e2e/**", "node_modules/**", "dist/**"],
    },
});
