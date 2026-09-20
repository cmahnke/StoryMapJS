import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #378 — "Add Hook Into Leaflet Map"
 * FIXED (superseded): the map engine is OpenLayers now and the instance is
 * exposed as `storymap.map` for direct access.
 */
test("issue #378: the underlying map instance is exposed as storymap.map", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const hook = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: { map?: { getView?: unknown; getLayers?: unknown } };
        };
        return {
            hasMap: !!sm.__sm?.map,
            hasView: typeof sm.__sm?.map?.getView === "function",
            hasLayers: typeof sm.__sm?.map?.getLayers === "function",
        };
    });
    expect(hook.hasMap).toBe(true);
    expect(hook.hasView).toBe(true);
    expect(hook.hasLayers).toBe(true);
});
