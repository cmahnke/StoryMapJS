import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #168 — "Resizing browser window from small -> large"
 * FIXED: the viewer now observes its container and window resizes and
 * re-layouts the map, slider and menubar (trackResize option, default on).
 */
test("issue #168: enlarging the window re-layouts the storymap", async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 500 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1200);

    const before = await page.evaluate(() => {
        const slider = document.querySelector("#storymap-embed .vco-storyslider");
        return {
            sliderWidth: slider?.getBoundingClientRect().width ?? 0,
            viewport: window.innerWidth,
        };
    });

    await page.setViewportSize({ width: 1400, height: 800 });
    // wait for the debounced resize handler (200ms) + layout
    await page.waitForTimeout(800);

    const after = await page.evaluate(() => {
        const slider = document.querySelector("#storymap-embed .vco-storyslider");
        return {
            sliderWidth: slider?.getBoundingClientRect().width ?? 0,
            viewport: window.innerWidth,
        };
    });

    expect(after.viewport).toBe(1400);
    expect(after.sliderWidth).toBeGreaterThan(before.sliderWidth * 1.2);
});
