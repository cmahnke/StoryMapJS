import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * The `map_bbox` option limits the map: nothing outside of the box
 * ([west, south, east, north] lon/lat) can be visible.
 */
test("map_bbox constrains the view", async ({ page }) => {
    // a bbox tightly around Florida
    const bbox = [-88, 24, -80, 31];
    await page.goto(harnessUrl("katrina", { map_bbox: bbox }));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const view = await page.evaluate(() => {
        const v = (
            window as unknown as {
                __sm?: {
                    _map?: {
                        _map?: { getView(): { get(prop: string): unknown; getCenter(): number[] } };
                    };
                };
            }
        ).__sm?._map?._map?.getView();
        return {
            extent: v?.get("extent") ? Array.from(v.get("extent") as number[]) : null,
            center: v?.getCenter(),
        };
    });
    // the extent constraint is set (projected coords of the bbox)
    expect(view.extent).not.toBeNull();
    expect(view.extent.length).toBe(4);

    // panning far away cannot move the visible area outside of the bbox:
    // at high zoom the viewport is smaller than the box, so the center is
    // clamped hard into it
    await page.evaluate(() => {
        const v = (
            window as unknown as {
                __sm?: {
                    _map?: {
                        _map?: {
                            getView(): { setZoom(z: number): void; setCenter(c: number[]): void };
                        };
                    };
                };
            }
        ).__sm?._map?._map?.getView();
        v?.setZoom(12);
        v?.setCenter([10_000_000, 9_000_000]); // far outside
    });
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => {
        const v = (
            window as unknown as {
                __sm?: { _map?: { _map?: { getView(): { getCenter(): number[] } } } };
            }
        ).__sm?._map?._map?.getView();
        return v?.getCenter() ?? [];
    });
    const [minX, minY, maxX, maxY] = view.extent;
    expect(after[0]).toBeGreaterThanOrEqual(minX);
    expect(after[0]).toBeLessThanOrEqual(maxX);
    expect(after[1]).toBeGreaterThanOrEqual(minY);
    expect(after[1]).toBeLessThanOrEqual(maxY);
});
