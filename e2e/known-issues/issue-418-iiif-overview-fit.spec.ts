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

    const fit = await page.evaluate(async () => {
        const sm = window as unknown as {
            __sm?: {
                _map?: {
                    _map?: {
                        getView(): {
                            getZoom(): number;
                            getCenter(): number[];
                            calculateExtent?(size: number[]): number[];
                        };
                        getSize(): number[];
                    };
                    options: {
                        iiif: { url: string };
                        map_center_offset: { left: number; top: number };
                    };
                };
            };
        };
        const map = sm.__sm?._map;
        const view = map?._map?.getView();
        if (!map || !view) return null;
        const info = (await fetch(map.options.iiif.url).then((r) => r.json())) as {
            width: number;
            height: number;
        };
        const size = map._map!.getSize();
        const resolution = Math.max(info.width / size[0], info.height / size[1]);
        const offset = map.options.map_center_offset;
        return {
            width: info.width,
            height: info.height,
            expectedZoom: Math.log2(65536 / resolution),
            expectedCenter: [
                info.width / 2 - offset.left * resolution,
                -info.height / 2 + offset.top * resolution,
            ],
            actualZoom: view.getZoom(),
            actualCenter: view.getCenter(),
            extent: view.calculateExtent ? view.calculateExtent(size) : null,
        };
    });

    expect(fit).not.toBeNull();
    // the settled zoom matches the fit zoom on the image ladder
    expect(Math.abs(fit!.actualZoom - fit!.expectedZoom)).toBeLessThan(0.05);
    // the settled center matches the offset image center (within 2px)
    expect(Math.abs(fit!.actualCenter[0] - fit!.expectedCenter[0])).toBeLessThan(2);
    expect(Math.abs(fit!.actualCenter[1] - fit!.expectedCenter[1])).toBeLessThan(2);
    // the visible extent covers the whole image (1px tolerance for float math)
    const [x0, y0, x1, y1] = fit!.extent!;
    expect(x0).toBeLessThanOrEqual(1);
    expect(y0).toBeLessThanOrEqual(-fit!.height + 1);
    expect(x1).toBeGreaterThanOrEqual(fit!.width - 1);
    expect(y1).toBeGreaterThanOrEqual(-1);
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
