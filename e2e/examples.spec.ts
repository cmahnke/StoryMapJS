import { test, expect, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Examples that use map_type "zoomify" - removed in favor of IIIF during the
// migration, so their specs are skipped there. Recorded here as the baseline.
const ZOOMIFY_EXAMPLES = new Set(["courbet", "gameofthrones", "jansteen", "seurat"]);

const exampleNames = readdirSync(join(process.cwd(), "public/examples"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));

async function collectPageErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    return errors;
}

for (const name of exampleNames) {
    test(`example: ${name}`, async ({ page }) => {
        const pageErrors = await collectPageErrors(page);
        test.skip(ZOOMIFY_EXAMPLES.has(name), "zoomify removed in favor of IIIF");

        await page.goto(`/harness.html?example=${encodeURIComponent(name)}`);

        await expect
            .poll(() => page.evaluate(() => (window as any).__smReady), { timeout: 30_000 })
            .toBe(true);

        const state = await page.evaluate(() => ({
            errors: (window as any).__smErrors,
            hasContainer: !!document.querySelector("#storymap-embed.vco-storymap"),
            slideCount: document.querySelectorAll("#storymap-embed .vco-slide").length,
        }));

        expect(pageErrors, `uncaught exceptions in ${name}`).toEqual([]);
        expect(state.errors, `window errors in ${name}`).toEqual([]);
        expect(state.hasContainer, `no .vco-storymap rendered for ${name}`).toBe(true);
        // "empty" legitimately renders no slides
        if (name !== "empty") {
            expect(state.slideCount, `no slides rendered for ${name}`).toBeGreaterThan(0);
        }

        // Slide navigation works where there is more than one slide
        if (state.slideCount > 1) {
            const next = page.locator("#storymap-embed .vco-slidenav-next").first();
            if (await next.isVisible()) {
                await next.click();
                await page.waitForTimeout(1500);
                expect(
                    await page.evaluate(() => (window as any).__smErrors),
                    `window errors after navigation in ${name}`
                ).toEqual([]);
            }
        }
    });
}
