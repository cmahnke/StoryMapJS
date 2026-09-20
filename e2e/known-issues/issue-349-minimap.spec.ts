import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUES #107 / #349 / #355 / #465 / #369 — minimap (locator map)
 * problems. The OpenLayers OverviewMap control replaces the custom Leaflet
 * minimap: it renders collapsed at top-left, tracks the main view extent
 * (intentional, #369) and stays inside the map bounds.
 */
test("issue #349/#107: the minimap renders collapsed at the top left", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2000);

    const minimap = await page.evaluate(() => {
        const el = document.querySelector("#storymap-embed .ol-overviewmap");
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const mapRect = document.querySelector("#storymap-embed .vco-map")!.getBoundingClientRect();
        return {
            collapsed: el.className.includes("ol-collapsed"),
            x: rect.x - mapRect.x,
            y: rect.y - mapRect.y,
            withinMap:
                rect.x >= mapRect.x - 2 &&
                rect.y >= mapRect.y - 2 &&
                rect.right <= mapRect.right + 2 &&
                rect.bottom <= mapRect.bottom + 2,
        };
    });

    expect(minimap).not.toBeNull();
    expect(minimap!.collapsed).toBe(true);
    expect(minimap!.withinMap).toBe(true);
});

test.fail("issue #465/#355: the minimap view is fitted to the image extent", async ({ page }) => {
    await page.goto(harnessUrl("iiif-wellcome"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const minimap = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: {
                _map?: {
                    _mini_map?: {
                        getOverviewMap(): {
                            getView(): { getCenter(): number[]; getZoom(): number };
                        };
                    };
                    _map?: { getSize(): number[] };
                };
            };
        };
        const mini = sm.__sm?._map?._mini_map;
        if (!mini) return null;
        const view = mini.getOverviewMap().getView();
        const center = view.getCenter();
        // the iiif image space extent is [0, 0, width, height] in EPSG:4326
        return { center, zoom: view.getZoom() };
    });

    expect(minimap).not.toBeNull();
    // the minimap view must be anchored inside the image extent, not at [0,0]
    expect(minimap!.center).not.toBeNull();
    expect(minimap!.center![0]).toBeGreaterThan(0);
    expect(minimap!.center![1]).toBeGreaterThan(0);
});

test("issue #369: the minimap tracks the main map extent (by design)", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2000);

    const extentBefore = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: {
                _map?: {
                    _mini_map?: { getOverviewMap(): { getView(): { getCenter(): number[] } } };
                    _map?: { getView(): { getCenter(): number[] } };
                };
            };
        };
        const mini = sm.__sm?._map?._mini_map;
        return mini?.getOverviewMap().getView().getCenter();
    });

    // expand via a marker navigation (which zooms in), the minimap view changes
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(2),
    );
    await page.waitForTimeout(2500);

    const extentAfter = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: {
                _map?: {
                    _mini_map?: { getOverviewMap(): { getView(): { getCenter(): number[] } } };
                    _map?: { getView(): { getCenter(): number[] } };
                };
            };
        };
        const mini = sm.__sm?._map?._mini_map;
        return mini?.getOverviewMap().getView().getCenter();
    });

    expect(extentBefore).not.toBeNull();
    expect(extentAfter).not.toBeNull();
    expect(extentBefore![0]).not.toBe(extentAfter![0]);
});
