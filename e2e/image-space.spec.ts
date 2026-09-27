import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * `isImageSpace()` distinguishes a IIIF image presented as a picture of the
 * world from a georeferenced IIIF map. The distinction matters because image
 * maps claim EPSG:4326 while the slide coordinates are *pixel* offsets, so any
 * `ol/proj` call on them yields garbage. The method is the supported way to ask,
 * so its answer has to be right for both shapes of the same fixture.
 */

async function waitForMap(page: import("@playwright/test").Page) {
    await expect
        .poll(
            () =>
                page.evaluate(
                    () => !!(window as unknown as { __sm?: { map?: unknown } }).__sm?.map,
                ),
            { timeout: 30_000 },
        )
        .toBe(true);
}

function imageSpaceState(page: import("@playwright/test").Page) {
    return page.evaluate(() => {
        const sm = (
            window as unknown as {
                __sm: {
                    isImageSpace(): boolean;
                    map: {
                        getView(): {
                            getProjection(): { getCode(): string };
                            getResolution(): number | undefined;
                        };
                    };
                    getMarkers(): unknown[];
                };
            }
        ).__sm;
        return {
            isImageSpace: sm.isImageSpace(),
            projection: sm.map.getView().getProjection().getCode(),
            resolution: sm.map.getView().getResolution(),
            markers: sm.getMarkers().length,
            errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        };
    });
}

test("an image-mode IIIF map reports image space and EPSG:4326", async ({ page }) => {
    await page.goto(harnessUrl("iiif-wellcome"));
    await waitForStoryMap(page);
    await waitForMap(page);
    await page.waitForTimeout(2500);

    const state = await imageSpaceState(page);
    expect(state.isImageSpace).toBe(true);
    // the projection really is 4326 — that is the trap: a host that treats it
    // as a mercator map and calls ol/proj on pixel coordinates gets garbage
    expect(state.projection).toBe("EPSG:4326");
    expect(state.resolution).toBeGreaterThan(0);
    expect(state.errors).toEqual([]);
});

test("a georeferenced IIIF map is not image space", async ({ page }) => {
    // The flip side, and it needs its own fixture: the *document* sets
    // map_as_image, and the document wins over a constructor option (the data
    // is merged into the options), so overriding it at construction does not
    // work. issue-iiif-geo is the same IIIF service with map_bbox instead.
    await page.goto(harnessUrl("issue-iiif-geo"));
    await waitForStoryMap(page);
    await waitForMap(page);
    await page.waitForTimeout(2000);

    const state = await imageSpaceState(page);
    expect(state.isImageSpace).toBe(false);
    expect(state.errors).toEqual([]);
});

test("an OSM map is not image space", async ({ page }) => {
    await page.goto(harnessUrl("empty"));
    await waitForStoryMap(page);
    await waitForMap(page);
    const state = await imageSpaceState(page);
    expect(state.isImageSpace).toBe(false);
    expect(state.projection).not.toBe("EPSG:4326");
});
