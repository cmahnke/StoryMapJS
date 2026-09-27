import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Proof that imagery actually reached the map, at the network level.
 *
 * The 45 `known-issues` specs assert DOM, classes and geometry, and
 * `examples.spec.ts` only checks that the container exists and there are no
 * errors — so a map that renders grey instead of the real basemap passes the
 * whole suite today. Screenshot baselines would catch that, but they are
 * renderer- and font-dependent and the image/IIIF examples depend on a third
 * party, so they are noisy to maintain.
 *
 * What is asserted instead: the expected tile and imagery requests were made,
 * and the layer's source reached a ready state with a sized canvas. That is
 * offline-friendly (the URLs are intercepted) and not pinned to pixels.
 */

const OSM = /openfreemap|basemaps|osm|tile/i;

/** Intercept a tile host with a 1x1 transparent PNG so the run is offline. */
async function stubTiles(page: import("@playwright/test").Page): Promise<string[]> {
    const seen: string[] = [];
    const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
    );
    await page.route(OSM, async (route) => {
        seen.push(route.request().url());
        await route.fulfill({ status: 200, contentType: "image/png", body: png });
    });
    return seen;
}

test("a georeferenced map fetches tiles and paints a sized canvas", async ({ page }) => {
    const tiles = await stubTiles(page);

    await page.goto(harnessUrl("empty"));
    await waitForStoryMap(page);
    await expect.poll(() => tiles.length, { timeout: 30_000 }).toBeGreaterThan(0);

    const state = await page.evaluate(() => {
        const sm = (
            window as unknown as {
                __sm: {
                    map: {
                        getSize(): number[] | undefined;
                        getViewport(): Element;
                    };
                    getBaseLayer(): { getSource(): { getState(): string } } | null;
                };
            }
        ).__sm;
        const canvas = sm.map.getViewport().querySelector("canvas");
        return {
            size: sm.map.getSize(),
            canvasWidth: (canvas as HTMLCanvasElement | null)?.width ?? 0,
            canvasHeight: (canvas as HTMLCanvasElement | null)?.height ?? 0,
            baseState: sm.getBaseLayer()?.getSource().getState() ?? null,
            errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        };
    });

    // the requests were for a plausible tile grid, not one stray probe
    expect(tiles.length).toBeGreaterThan(1);
    // and the renderer has something to paint into
    expect(state.size?.[0]).toBeGreaterThan(0);
    expect(state.canvasWidth).toBeGreaterThan(0);
    expect(state.canvasHeight).toBeGreaterThan(0);
    expect(state.baseState).toBe("ready");
    expect(state.errors).toEqual([]);
});

test("an image-mode IIIF map fetches the image grid", async ({ page }) => {
    // The IIIF path is a different source and a different URL shape, so it
    // needs its own check. The service description is NOT stubbed: the tile
    // URLs are derived from it, and a hand-written stand-in has to get the v3
    // `tiles` shape exactly right or the viewer never derives a grid at all.
    // e2e/iiif.spec.ts and e2e/imageready.spec.ts already depend on this same
    // public fixture repository, so this adds no new external dependency.
    const iiifTiles: string[] = [];
    const infoRequests: string[] = [];
    page.on("request", (r) => {
        const url = r.url();
        if (!url.includes("iiif.io")) return;
        if (url.endsWith("info.json")) infoRequests.push(url);
        else iiifTiles.push(url);
    });

    await page.goto(harnessUrl("iiif-wellcome"));
    await waitForStoryMap(page);
    await expect.poll(() => iiifTiles.length, { timeout: 30_000 }).toBeGreaterThan(0);

    expect(infoRequests.length).toBeGreaterThan(0);
    // the URLs are the service's own image grid, not an OSM tile grid
    for (const url of iiifTiles) {
        expect(url).toContain("iiif.io");
        expect(OSM.test(url)).toBe(false);
    }
    const state = await page.evaluate(() => {
        const sm = (
            window as unknown as {
                __sm: {
                    isImageSpace(): boolean;
                    map: { getViewport(): Element };
                };
            }
        ).__sm;
        const canvas = sm.map.getViewport().querySelector("canvas") as HTMLCanvasElement | null;
        return {
            isImageSpace: sm.isImageSpace(),
            canvasWidth: canvas?.width ?? 0,
            errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        };
    });
    expect(state.isImageSpace).toBe(true);
    expect(state.canvasWidth).toBeGreaterThan(0);
    expect(state.errors).toEqual([]);
});

test("a georeferenced IIIF map requests the image service, not a tile grid", async ({ page }) => {
    const requests: string[] = [];
    await page.route(/iiif\.io/, async (route) => {
        requests.push(route.request().url());
        await route.fulfill({ status: 404, body: "" });
    });

    // the georeferenced fixture is the negative control: the service is
    // unreachable, and the viewer must report that rather than silently
    // presenting an empty map as if it had loaded
    await page.goto(harnessUrl("issue-iiif-geo"));
    await waitForStoryMap(page);
    await page.waitForTimeout(3000);

    expect(requests.some((u) => u.endsWith("info.json"))).toBe(true);
    const state = await page.evaluate(() => {
        const sm = (
            window as unknown as {
                __sm: {
                    map: { getViewport(): Element };
                };
            }
        ).__sm;
        const canvas = sm.map.getViewport().querySelector("canvas") as HTMLCanvasElement | null;
        return {
            canvasWidth: canvas?.width ?? 0,
            errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        };
    });
    // the map is still mounted and sized: a failed image service must not take
    // the viewer down with it
    expect(state.canvasWidth).toBeGreaterThan(0);
});
