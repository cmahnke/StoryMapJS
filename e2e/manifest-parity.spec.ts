import { test, expect, type Page } from "@playwright/test";
import { collectPageErrors, getState, waitForStoryMap } from "./known-issues/helpers";

/**
 * Every option of the legacy storymap format has a IIIF Presentation
 * counterpart: the same story loaded as storymap JSON and as its converted
 * manifest must reach the viewer with identical options. The terms live in
 * the manifest's map configuration service (IIIF has no basemap or tile
 * layer vocabulary of its own).
 */
const OPTION_KEYS = ["map_area", "overview_extent", "keyboard", "overlays"] as const;

async function optionsFrom(page: Page, url: string): Promise<Record<string, unknown>> {
    const pageErrors = collectPageErrors(page);
    await page.goto(url);
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);
    expect(pageErrors, "uncaught exceptions").toEqual([]);
    const state = await getState(page);
    expect(state.errors, "window errors").toEqual([]);
    return page.evaluate(
        (keys) => {
            const options = (window as unknown as { __sm?: { options?: Record<string, unknown> } })
                .__sm?.options as Record<string, unknown>;
            const picked: Record<string, unknown> = {};
            for (const key of keys) {
                picked[key] = options?.[key];
            }
            return picked;
        },
        OPTION_KEYS as unknown as string[],
    );
}

test("the converted manifest yields the same options as the storymap JSON", async ({ page }) => {
    const fromJson = await optionsFrom(page, "/harness.html?example=map-area-overlays");
    const fromManifest = await optionsFrom(page, "/harness.html?manifest=map-area-overlays");

    expect(fromJson.map_area).toBe("left");
    expect(fromJson.keyboard).toBe(true);
    expect(fromJson.overview_extent).toEqual([-0.6, 51.2, 0.4, 51.8]);
    expect(fromJson.overlays).toHaveLength(2);
    expect(fromManifest).toEqual(fromJson);
});

test("the map is limited to the visible half in both variants", async ({ page }) => {
    for (const url of [
        "/harness.html?example=map-area-overlays",
        "/harness.html?manifest=map-area-overlays",
    ]) {
        await page.goto(url);
        await waitForStoryMap(page);
        await page.waitForTimeout(1500);
        const state = await page.evaluate(() => {
            const container = document.querySelector("#storymap-embed.vco-storymap")!;
            const map = document.querySelector("#storymap-embed .vco-map")!;
            return {
                hasLeftClass: container.className.includes("vco-map-area-left"),
                mapWidth: Math.round(map.getBoundingClientRect().width),
                containerWidth: Math.round(container.getBoundingClientRect().width),
            };
        });
        expect(state.hasLeftClass, url).toBe(true);
        expect(state.mapWidth, url).toBeCloseTo(state.containerWidth / 2, -1);
    }
});
