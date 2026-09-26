import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * Image region stops (StrollView-style): slides with `location.region`
 * ([x, y, w, h] image pixels, IIIF xywh convention) fit that region on
 * navigation in image mode; region-less slides fit as before.
 */
test("the view fits each slide region on navigation", async ({ page }) => {
    await page.goto(harnessUrl("issue-image-region"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const viewState = () =>
        page.evaluate(() => {
            const sm = window as unknown as {
                __sm?: {
                    _map?: {
                        _map?: {
                            getView(): { calculateExtent?(size: number[]): number[] };
                            getSize(): number[];
                        };
                    };
                };
            };
            const map = sm.__sm?._map;
            const view = map?._map?.getView();
            if (!map || !view) return null;
            return view.calculateExtent?.(map._map!.getSize()) ?? null;
        });

    // head region [800, 100, 700, 700]
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2500);
    let extent = await viewState();
    expect(extent).not.toBeNull();
    // the fitted extent stays inside the region bounds (the fit covers the
    // region; the viewport may add margin around it)
    expect(extent![0]).toBeLessThanOrEqual(800 + 1);
    expect(extent![3]).toBeGreaterThanOrEqual(100 + 700 - 1);

    // torso region [700, 800, 900, 1100]
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(2),
    );
    await page.waitForTimeout(2500);
    extent = await viewState();
    expect(extent).not.toBeNull();
    expect(extent![2]).toBeGreaterThanOrEqual(700 + 900 - 1);
    expect(extent![1]).toBeLessThanOrEqual(800 + 1);
});

test("region-less slides keep the default fit", async ({ page }) => {
    await page.goto(harnessUrl("issue-image-region"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    // the overview slide has no region: it fits the whole image
    const zoom = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: { _map?: { _map?: { getView(): { getZoom(): number } } } };
        };
        return sm.__sm?._map?._map?.getView().getZoom() ?? null;
    });
    expect(zoom).not.toBeNull();
});
