import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUES #107 / #271 — overview centerpoint
 * FIXED: the map_overview_center option ({lat, lon}) centers the overview on
 * a user-selected point while keeping the markers-fit zoom.
 */
test("issue #107/#271: map_overview_center centers the overview", async ({ page }) => {
    await page.goto(
        harnessUrl("issue-506-marker-sync", { map_overview_center: { lat: 48.85, lon: 2.35 } }),
    );
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    // the Paris marker (lon 2.35) must sit in the visible left half of the
    // map, clear of the slide panel — instead of the default multi-marker
    // fit that centers between Paris, Rome and Madrid
    const markerX = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: {
                _map?: {
                    _markers: { data: { location?: { lon?: number } }; _marker: HTMLElement }[];
                    _map?: { getPixelFromCoordinate(c: number[]): number[] };
                };
            };
        };
        const map = sm.__sm?._map;
        if (!map) return null;
        const paris = map._markers.find((m) => m.data.location?.lon === 2.35);
        if (!paris || !map._map) return null;
        const el = paris._marker.getBoundingClientRect();
        return Math.round(el.x + el.width / 2);
    });
    expect(markerX).not.toBeNull();
    // left half of the 1280px viewport, clear of the slide panel
    expect(markerX!).toBeGreaterThan(0);
    expect(markerX!).toBeLessThan(640);
});
