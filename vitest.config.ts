import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        environmentOptions: {
            jsdom: {
                url: "https://storymap.knightlab.com/edit/",
            },
        },
        include: ["tests/**/*.test.ts"],
        // Playwright owns the browser specs
        exclude: ["e2e/**", "node_modules/**", "dist/**"],
    },
});
