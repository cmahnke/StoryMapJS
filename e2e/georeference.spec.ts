import { test, expect, type Page } from "@playwright/test";
import { collectPageErrors, getState, waitForStoryMap } from "./known-issues/helpers";

/**
 * A georeferenced layer is the one map feature IIIF models natively: the
 * Georeference Extension supplies ground control points that place a IIIF
 * image on the geographic map. The manifest's map configuration service
 * carries them as `storymap:georeferencedLayers`; the viewer fits them
 * affinely and places the image.
 */
async function openManifest(
    page: Page,
    name: string,
): Promise<{ pageErrors: string[]; logs: string[]; zIndexes: number[] }> {
    const pageErrors = collectPageErrors(page);
    const logs: string[] = [];
    page.on("console", (message) => logs.push(message.text()));
    await page.goto(`/harness.html?manifest=${name}`);
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);
    const state = await getState(page);
    expect(state.errors, "window errors").toEqual([]);
    const zIndexes = await page.evaluate(() => {
        const inner = (
            window as unknown as {
                __sm?: {
                    _map?: { _map?: { getLayers(): { getArray(): { getZIndex(): number }[] } } };
                };
            }
        ).__sm?._map?._map;
        return (inner?.getLayers().getArray() ?? []).map((layer) => layer.getZIndex());
    });
    return { pageErrors, logs, zIndexes };
}

test("a georeferenced manifest places the sheet on the map", async ({ page }) => {
    const { pageErrors, zIndexes } = await openManifest(page, "georeferenced-layer");

    expect(pageErrors, "uncaught exceptions").toEqual([]);
    // base tiles at z 0, the placed sheet at z 1, route lines above
    expect(zIndexes).toContain(1);

    // the sheet sits in the fitted geographic extent: the manifest's five
    // control points put the 2315x3000 image over 4.45..4.5 E, 51.9..51.92 N.
    // The source is declared in EPSG:4326, so its tile grid extent is the
    // fitted lon/lat box.
    const placed = await page.evaluate(() => {
        const overlays = (
            window as unknown as {
                __sm?: {
                    _map?: {
                        _overlay_layers?: {
                            getSource(): { getTileGrid(): { getExtent(): number[] } };
                        }[];
                    };
                };
            }
        ).__sm?._map?._overlay_layers;
        return overlays?.[0]?.getSource().getTileGrid().getExtent() ?? null;
    });
    expect(placed).not.toBeNull();
    for (const [index, expected] of [4.45, 51.9, 4.5, 51.92].entries()) {
        expect(placed![index]).toBeCloseTo(expected, 3);
    }
});

test("a polygon navPlace constrains the map to its bounding box", async ({ page }) => {
    const { pageErrors } = await openManifest(page, "georeferenced-layer");
    expect(pageErrors, "uncaught exceptions").toEqual([]);

    const bbox = await page.evaluate(() => {
        const options = (
            window as unknown as { __sm?: { options?: { map_bbox?: number[] | null } } }
        ).__sm?.options;
        return options?.map_bbox ?? null;
    });
    expect(bbox).toEqual([4.44, 51.895, 4.51, 51.925]);
});

test("a placement the viewer cannot draw is reported and skipped", async ({ page }) => {
    const { pageErrors, logs } = await openManifest(page, "georeferenced-layer-unsupported");

    expect(pageErrors, "uncaught exceptions").toEqual([]);
    const overlayCount = await page.evaluate(() => {
        const map = (window as unknown as { __sm?: { _map?: { getOverlayCount(): number } } }).__sm
            ?._map;
        return map?.getOverlayCount() ?? -1;
    });
    expect(overlayCount).toBe(0);
    expect(logs.join("\n")).toContain("thinPlateSpline");
    // the skipped layer's credit never reaches the attribution line
    const attribution = await page.evaluate(
        () => document.querySelector("#storymap-embed .vco-map-attribution")?.textContent ?? "",
    );
    expect(attribution).not.toContain("Never placed");
});
