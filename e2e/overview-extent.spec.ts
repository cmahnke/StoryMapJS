import { test, expect } from "@playwright/test";
import { collectPageErrors, getState, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * The `overview_extent` option constrains the minimap overview to a
 * lon/lat box instead of letting it roam the whole world.
 */
test("overview_extent constrains the minimap overview", async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await page.goto(
        harnessUrl("issue-305-start-at-slide", {
            map_mini: true,
            overview_extent: [5, 50, 6, 51],
        }),
    );
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const center = await page.evaluate(() => {
        const sm = (window as unknown as { __sm?: unknown }).__sm as {
            _map?: {
                _mini_map?: {
                    getOverviewMap(): { getView(): { getCenter(): number[] | undefined } };
                };
            };
        };
        return sm?._map?._mini_map?.getOverviewMap().getView().getCenter();
    });
    // fromLonLat([5, 50])..fromLonLat([6, 51]) ≈ [556597, 6446275, 667916, 6621293]
    expect(center?.[0]).toBeGreaterThanOrEqual(556597);
    expect(center?.[1]).toBeGreaterThanOrEqual(6446275);
    expect(center?.[0]).toBeLessThanOrEqual(667917);
    expect(center?.[1]).toBeLessThanOrEqual(6621294);

    const state = await getState(page);
    expect(state.errors).toEqual([]);
    expect(pageErrors).toEqual([]);
});
