import { test, expect } from "@playwright/test";

// The IIIF Image API layer (replaces the removed Zoomify support):
// an image-mode storymap backed by an info.json must fetch and render
// IIIF tiles from the referenced image server.
test("IIIF example renders tiles from the image server", async ({ page }) => {
    await page.goto("/harness.html?example=iiif-wellcome");

    await expect
        .poll(
            async () =>
                page.evaluate(() =>
                    [...document.querySelectorAll<HTMLImageElement>("#storymap-embed img.leaflet-tile")].some(
                        (t) => t.src.includes("iiif.io") && t.complete && t.naturalWidth > 0
                    )
                ),
            { timeout: 20_000, message: "waiting for a loaded IIIF tile" }
        )
        .toBe(true);

    const errors = await page.evaluate(() => (window as any).__smErrors);
    expect(errors).toEqual([]);
});
