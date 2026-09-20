import { test, expect } from "@playwright/test";
import { collectPageErrors, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #405 — "Use Custom Marker Error"
 * FIXED: storymaps with use_custom_markers render the custom icon images
 * without throwing.
 */
test("issue #405: custom markers render without errors", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto(harnessUrl("instagram_couch"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const markers = await page.evaluate(() => {
        const imgs = document.querySelectorAll(
            "#storymap-embed .vco-mapmarker img, #storymap-embed .vco-mapmarker-active img",
        );
        return {
            markerCount: document.querySelectorAll("#storymap-embed .vco-mapmarker").length,
            iconCount: imgs.length,
        };
    });

    expect(errors).toEqual([]);
    expect(markers.markerCount).toBeGreaterThan(0);
    expect(markers.iconCount).toBeGreaterThan(0);
});
