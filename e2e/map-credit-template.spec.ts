import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap, stubTiles, getState } from "./known-issues/helpers";

/**
 * A full XYZ template naming a known provider
 * (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) credits that provider —
 * the credit used to match only the `osm*` map type, so the longhand
 * template rendered the generic "Map data" line.
 */
test("a longhand OSM template credits OpenStreetMap", async ({ page }) => {
    // NOTE: the fixture name must not match TILE_HOST (/osm|tile/...) or the
    // stub swallows the harness page and the fixture fetch themselves.
    await stubTiles(page);
    await page.goto(harnessUrl("map-template-provider"));
    await waitForStoryMap(page);

    const attribution = await page.evaluate(
        () => document.querySelector("#storymap-embed .vco-map-attribution")?.textContent ?? "",
    );
    expect(attribution).toContain("OpenStreetMap");
    expect(attribution).not.toContain("Map data");

    const state = await getState(page);
    expect(state.errors).toEqual([]);
});
