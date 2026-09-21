/**
 * Generate landing-page example card thumbnails: each curated fixture is
 * rendered in the built viewer (dist/harness.html) with headless Chromium
 * and screenshotted to public/thumbs/<id>.jpg.
 *
 * Requires a prior `npm run build` (serves dist in-process via Vite's
 * preview API, or set THUMBS_SERVER to point at an existing server).
 *
 * Usage: node tasks/build-thumbnails.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { preview } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/thumbs");
const port = Number(process.env.THUMBS_PORT ?? 8400);

const EXAMPLES = [
    "katrina",
    "population",
    "marktwain",
    "nightwatch",
    "seurat",
    "courbet",
    "jansteen",
    "iiif-wellcome",
    "president",
];

// remote showcase examples: rendered through the embed player (needs network)
const REMOTE_EXAMPLES = [
    {
        id: "bosch-garden",
        url: "https://s3.amazonaws.com/uploads.knightlab.com/storymapjs/a1a349b51799ee49e96bed10cc235e7f/garden-of-earthly-delights/published.json",
    },
    {
        id: "southern-literary-trail",
        url: "https://uploads.knightlab.com/storymapjs/3df56e350378e51781746bfb2a2ea428/test/published.json",
    },
];

mkdirSync(outDir, { recursive: true });

const server = process.env.THUMBS_SERVER;
let previewServer = null;
if (!server) {
    // serve dist/ in-process via Vite's preview API (no child process)
    previewServer = await preview({
        root,
        logLevel: "silent",
        preview: { port, strictPort: true },
    });
}
const base = server ?? previewServer.resolvedUrls.local[0].replace(/\/$/, "");

// wait for the preview server to answer
for (let i = 0; i < 60; i++) {
    try {
        const res = await fetch(`${base}/harness.html`);
        if (res.ok) break;
    } catch {
        /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 450 } });

for (const id of EXAMPLES) {
    try {
        await page.goto(`${base}/harness.html?example=${encodeURIComponent(id)}`);
        await page.waitForFunction(
            () => !!globalThis.document?.querySelector("#storymap-embed.vco-storymap"),
            {
                timeout: 30_000,
            },
        );
        // give the map/media a moment to settle
        await page.waitForTimeout(3500);
        await page.screenshot({ path: resolve(outDir, `${id}.jpg`), type: "jpeg", quality: 80 });
        console.log(`thumbs: ${id}.jpg`);
    } catch (err) {
        console.error(`thumbs: FAILED for ${id}: ${err}`);
    }
}

for (const { id, url } of REMOTE_EXAMPLES) {
    try {
        await page.goto(`${base}/embed/index.html?url=${encodeURIComponent(url)}`);
        await page.waitForFunction(
            () => !!globalThis.document?.querySelector("#storymap-embed.vco-storymap"),
            {
                timeout: 45_000,
            },
        );
        await page.waitForTimeout(5000);
        await page.screenshot({ path: resolve(outDir, `${id}.jpg`), type: "jpeg", quality: 80 });
        console.log(`thumbs: ${id}.jpg`);
    } catch (err) {
        console.error(`thumbs: FAILED for ${id}: ${err}`);
    }
}

await browser.close();
if (previewServer) {
    await previewServer.close();
}
