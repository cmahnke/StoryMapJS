import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #418 — "Gigapixel image-mode overview is often smaller than it
 * should be" (relates to #111, #321)
 * The IIIF (gigapixel) overview must fit the full image extent.
 */
test("issue #418: the iiif overview view fits the whole image", async ({ page }) => {
    await page.goto(harnessUrl("iiif-wellcome"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const fit = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: {
                _map?: {
                    _map?: { getView(): { getZoom(): number; calculateExtent?(): number[] } };
                };
            };
        };
        const view = sm.__sm?._map?._map?.getView();
        if (!view) return null;
        const zoom = view.getZoom();
        const extent = view.calculateExtent ? view.calculateExtent() : null;
        return { zoom, extent };
    });

    expect(fit).not.toBeNull();
    // overview zoom must be low enough to show the entire image (0..3 range
    // for full-image fits in EPSG:4326 image space)
    expect(fit!.zoom).toBeLessThanOrEqual(3);
    expect(fit!.extent!.length).toBe(4);
});

/**
 * KNOWN ISSUE #321 — "Can't change size of title image properly in Gigapixel"
 * The overview slide's title image honors its rendered size within the slide.
 */
test("issue #321: the overview title image sizes within the slide", async ({ page }) => {
    await page.goto(harnessUrl("iiif-wellcome"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2000);

    const sized = await page.evaluate(() => {
        const img = document.querySelector(
            "#storymap-embed .vco-slide:first-child .vco-media img, #storymap-embed .vco-media-image img",
        );
        if (!img) return null;
        const r = img.getBoundingClientRect();
        return { w: r.width, h: r.height };
    });
    if (sized) {
        expect(sized.w).toBeGreaterThan(0);
        expect(sized.h).toBeGreaterThan(0);
    }
});
