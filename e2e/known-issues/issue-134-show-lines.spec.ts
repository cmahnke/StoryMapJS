import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #134 — "Support/document how to disable connecting lines on maps"
 * The `show_lines: false` storymap option must hide the connecting lines
 * between markers. FIXED: the option is honored by the OpenLayers renderer.
 */
test("issue #134: show_lines: false hides the connecting lines", async ({ page }) => {
    await page.goto(harnessUrl("issue-134-no-lines"));
    await waitForStoryMap(page);

    const lineVisible = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: { _map?: { _line?: { getVisible(): boolean } } };
        };
        return sm.__sm?._map?._line ? sm.__sm._map._line.getVisible() : null;
    });
    expect(lineVisible).toBe(false);

    const markerCount = await page.evaluate(
        () => document.querySelectorAll("#storymap-embed .vco-map .vco-mapmarker").length,
    );
    expect(markerCount).toBeGreaterThan(0);
});

/**
 * show_lines defaults to true — lines are visible (control case).
 */
test("issue #134: lines are shown by default", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const lineVisible = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: { _map?: { _line?: { getVisible(): boolean } } };
        };
        return sm.__sm?._map?._line ? sm.__sm._map._line.getVisible() : null;
    });
    expect(lineVisible).toBe(true);
});
