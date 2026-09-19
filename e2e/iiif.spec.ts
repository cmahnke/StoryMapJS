import { test, expect } from "@playwright/test";
import type { Map as OlMap } from "ol";
import type { Tile as TileLayer } from "ol/layer";
import type { IIIF } from "ol/source";

// The IIIF Image API layer (replaces the removed Zoomify support):
// an image-mode storymap backed by an info.json must load the source and
// render it on the OpenLayers canvas.
test("IIIF example renders on the OpenLayers canvas", async ({ page }) => {
    await page.goto("/harness.html?example=iiif-wellcome");

    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const map = (window as unknown as { __sm?: { map?: OlMap } }).__sm?.map;
                    if (!map) return false;
                    const layer = map.getLayers()?.getArray()?.[0] as TileLayer<IIIF> | undefined;
                    const source = layer?.getSource?.();
                    if (!source || source.getState() !== "ready") return false;
                    const canvas = map.getViewport()?.querySelector("canvas");
                    return !!(canvas && canvas.width > 0 && canvas.height > 0);
                }),
            { timeout: 20_000, message: "waiting for the IIIF source and canvas" },
        )
        .toBe(true);

    const errors = await page.evaluate(() => (window as unknown as { __smErrors?: string[] }).__smErrors);
    expect(errors).toEqual([]);
});
