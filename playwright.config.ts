import { defineConfig } from "@playwright/test";

// Characterization suite: runs against the current webpack dev server.
// After the Vite migration the same specs must pass against the new dev/preview server.
export default defineConfig({
    testDir: "./e2e",
    timeout: 60_000,
    retries: 0,
    workers: 1,
    use: {
        baseURL: "http://localhost:8200",
        viewport: { width: 1280, height: 800 },
    },
    webServer: {
        command: "npm run build && npx vite preview --port 8200 --strictPort",
        url: "http://localhost:8200/harness.html?example=katrina",
        reuseExistingServer: true,
        timeout: 120_000,
    },
    reporter: [["list"]],
});
