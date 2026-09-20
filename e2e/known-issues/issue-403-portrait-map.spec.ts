import { test, expect } from "@playwright/test";
import { collectPageErrors, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #403 — "Map Does Not Load on Portrait But Does on Landscape"
 * FIXED: in a tall, narrow container the map still renders (portrait layout).
 */
test("issue #403: the map renders in portrait orientation", async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 820 });
    const errors = collectPageErrors(page);
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2000);

    const layout = await page.evaluate(() => {
        const map = document.querySelector("#storymap-embed .vco-map");
        const canvas = document.querySelector("#storymap-embed .vco-map canvas");
        const r = map?.getBoundingClientRect();
        return {
            mapWidth: r?.width ?? 0,
            mapHeight: r?.height ?? 0,
            hasCanvas: !!canvas,
            isPortrait: document
                .querySelector("#storymap-embed")
                ?.className.includes("vco-portrait"),
        };
    });

    expect(layout.mapHeight).toBeGreaterThan(0);
    expect(layout.hasCanvas).toBe(true);
    expect(errors).toEqual([]);
});
