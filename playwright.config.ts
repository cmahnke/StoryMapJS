import { defineConfig, devices } from "@playwright/test";

// Characterization suite: runs against the preview server built from source.
//
// By default this runs on Chromium only, which is what `npm run test:e2e` and
// the main CI job do. `E2E_ALL_BROWSERS=1` (npm run test:e2e:all) adds Firefox
// and WebKit for a separate, non-blocking CI job. The engine was replaced
// wholesale (Leaflet -> OpenLayers) and the teardown work leans on the Web
// Animations API, so engine-specific divergence in getAnimations(),
// scrollBy({behavior}) and OL canvas setup is only visible across engines.
//
// Workers stay at 1 even for the matrix: a full run is ~6 minutes on Chromium,
// and at 3 engines that is acceptable for a non-blocking job, while more
// workers proved flaky (a canvas-initialisation race under load).
const ALL_BROWSERS = process.env.E2E_ALL_BROWSERS === "1";

const chromium = { name: "chromium", use: { ...devices["Desktop Chrome"] } };
const projects = ALL_BROWSERS
    ? [
          chromium,
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
      ]
    : [chromium];

export default defineConfig({
    testDir: "./e2e",
    timeout: 60_000,
    retries: 0,
    workers: 1,
    projects,
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
