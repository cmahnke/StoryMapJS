import { test, expect } from "@playwright/test";
import { collectPageErrors, getState, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Stacked raster overlays (the `overlays` option): declarative layers above
 * the base map with per-layer presentation and attribution sync.
 */
test("overlays stack above the base map with synced attribution", async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await page.goto(
        harnessUrl("issue-305-start-at-slide", {
            overlays: [
                {
                    map_type: "https://tiles.example.com/base/{z}/{x}/{y}.png",
                    opacity: 0.8,
                    attribution: "Base overlay credit",
                },
                {
                    map_type: "https://tiles.example.com/top/{z}/{x}/{y}.png",
                    className: "e2e-overlay",
                    blendMode: "multiply",
                    attribution: "Top overlay credit",
                },
            ],
        }),
    );
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const overlayCount = await page.evaluate(
        () =>
            (window as unknown as { __sm?: { _map?: { getOverlayCount(): number } } }).__sm?._map?.getOverlayCount(),
    );
    expect(overlayCount).toBe(2);

    const attribution = page.locator("#storymap-embed .vco-map-attribution");
    await expect(attribution).toContainText("Base overlay credit");
    await expect(attribution).toContainText("Top overlay credit");

    // the blended overlay paints into its own container with the blend mode
    // (the container class replaces the default wholesale, hence no
    // `.ol-layer` prefix in the selector)
    const blend = await page.evaluate(
        () =>
            (document.querySelector("#storymap-embed .e2e-overlay") as HTMLElement | null)?.style
                .mixBlendMode,
    );
    expect(blend).toBe("multiply");

    // hiding an overlay drops its credit but keeps the base attribution
    await page.evaluate(() =>
        (
            window as unknown as { __sm?: { setOverlayVisible(i: number, v: boolean): void } }
        ).__sm?.setOverlayVisible(1, false),
    );
    await expect(attribution).not.toContainText("Top overlay credit");
    await expect(attribution).toContainText("Base overlay credit");

    const state = await getState(page);
    expect(state.errors).toEqual([]);
    expect(pageErrors).toEqual([]);
});
