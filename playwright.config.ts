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
    webServer: [
        {
            command: "npm run build && npx vite preview --port 8200 --strictPort",
            url: "http://localhost:8200/harness.html?example=katrina",
            reuseExistingServer: true,
            timeout: 120_000,
        },
        {
            // static server for the repo root: the contrib examples load
            // ../../dist/js/storymap.js relative to contrib/examples/
            command: "node scripts/serve-root.mjs . 8300",
            url: "http://localhost:8300/index.html",
            reuseExistingServer: true,
            timeout: 60_000,
        },
        {
            // dev server: the embed page falls back to the source entry here
            command: "npx vite --port 8500 --strictPort",
            url: "http://localhost:8500/index.html",
            reuseExistingServer: true,
            timeout: 120_000,
        },
    ],
    reporter: [["list"]],
});
