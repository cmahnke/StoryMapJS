import { test, expect } from "@playwright/test";

// The IIIF Image API layer (replaces the removed Zoomify support):
// an image-mode storymap backed by an info.json must load the source and
// render it on the OpenLayers canvas.
test("IIIF example renders on the OpenLayers canvas", async ({ page }) => {
    await page.goto("/harness.html?example=iiif-wellcome");

    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const map = (window as any).__sm?.map;
                    if (!map) return false;
                    const source = map.getLayers()?.getArray()?.[0]?.getSource?.();
                    if (!source || source.getState() !== "ready") return false;
                    const canvas = map.getViewport()?.querySelector("canvas");
                    return !!(canvas && canvas.width > 0 && canvas.height > 0);
                }),
            { timeout: 20_000, message: "waiting for the IIIF source and canvas" },
        )
        .toBe(true);

    const errors = await page.evaluate(() => (window as any).__smErrors);
    expect(errors).toEqual([]);
});
