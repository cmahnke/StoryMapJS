import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * Zoomify rendering: cropped edge tiles must not stretch, and the minimap
 * must show the whole image sharply.
 *
 * - Edge tiles are cropped server-side (e.g. 88x256); drawing them over the
 *   full 256x256 tile box smeared the Bosch overview bottom and stretched
 *   the Literary Trail edges. They are padded onto a full canvas instead.
 * - The minimap was pinned to zoom 0 (smallest pyramid level, cropped
 *   upscale); it now fits the image extent on the pyramid ladder.
 *
 * Uses the local zoomify-clamp fixture (600x400 pyramid with cropped edges
 * under /examples/assets/zoomify-clamp/), so no network is involved.
 */

interface RenderedTile {
    getTileCoord(): number[];
    getState(): number;
    getImage(): { tagName?: string; width?: number; height?: number } | null;
}

interface HarnessWindow {
    __sm?: {
        _map?: {
            _map?: {
                getView(): {
                    getProjection(): unknown;
                    setResolution(res: number): void;
                    setCenter(center: [number, number]): void;
                };
            };
            _tile_layer?: {
                getSource(): {
                    getTileGrid(): { getResolutions(): number[] };
                };
                getRenderer(): { renderedTiles: RenderedTile[] } | null;
            };
            _zoomifyPyramid(): { extent: number[] } | null;
            _mini_map?: {
                getOverviewMap(): {
                    getView(): {
                        getResolution(): number;
                        getResolutions(): number[] | null;
                        calculateExtent(size: number[]): number[];
                    };
                    getSize(): number[] | undefined;
                };
            };
        };
    };
}

test("zoomify edge tiles are padded, not stretched", async ({ page }) => {
    await page.goto(harnessUrl("zoomify-clamp"));
    await waitForStoryMap(page);

    const tiles = await page.evaluate(async () => {
        const sm = (window as unknown as HarnessWindow).__sm;
        const map = sm?._map?._map;
        const layer = sm?._map?._tile_layer;
        if (!map || !layer) return null;
        const source = layer.getSource();
        const view = map.getView();
        // full-resolution pyramid level 2 lives at ladder index 3 (shifted)
        const res = source.getTileGrid().getResolutions()[3];
        // right-bottom edge area (cropped 88x144 tile 2-2-1) + interior
        const extent = sm?._map?._zoomifyPyramid()?.extent;
        if (!extent) return null;
        const edge: [number, number] = [
            extent[0] + (extent[2] - extent[0]) * 0.97,
            extent[1] + (extent[3] - extent[1]) * 0.03,
        ];
        view.setResolution(res);
        view.setCenter(edge);
        const renderer = layer.getRenderer();
        const find = (z: number, x: number, y: number) =>
            renderer?.renderedTiles.find((t) => {
                const c = t.getTileCoord();
                return c[0] === z && c[1] === x && c[2] === y && t.getState() === 2;
            });
        const deadline = Date.now() + 15000;
        let edgeTile: RenderedTile | undefined;
        let innerTile: RenderedTile | undefined;
        while (Date.now() < deadline) {
            edgeTile = find(3, 2, 1);
            innerTile = find(3, 0, 0);
            if (edgeTile && innerTile) break;
            await new Promise((r) => setTimeout(r, 200));
        }
        if (!edgeTile || !innerTile) return { loaded: false };
        const describe = (t: RenderedTile) => {
            const img = t.getImage();
            return {
                tag: img?.tagName ?? null,
                w: img?.width ?? null,
                h: img?.height ?? null,
            };
        };
        return { loaded: true, edge: describe(edgeTile), inner: describe(innerTile) };
    });

    expect(tiles).not.toBeNull();
    expect(tiles!.loaded).toBe(true);
    // the cropped 88x144 edge tile renders on a full padded canvas
    expect(tiles!.edge.tag).toBe("CANVAS");
    expect(tiles!.edge.w).toBe(256);
    expect(tiles!.edge.h).toBe(256);
    // full-size tiles keep their image element (OpenLayers' own handling)
    expect(tiles!.inner.tag).toBe("IMG");
});

test("zoomify minimap shows the whole image", async ({ page }) => {
    await page.goto(harnessUrl("zoomify-clamp"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const minimap = await page.evaluate(() => {
        const sm = (window as unknown as HarnessWindow).__sm;
        const mini = sm?._map?._mini_map?.getOverviewMap();
        const pyramid = sm?._map?._zoomifyPyramid();
        if (!mini || !pyramid) return null;
        const view = mini.getView();
        const rawSize = mini.getSize();
        // collapsed minimap reports no layout size: same fallback as the fit
        const size =
            rawSize && rawSize[0] >= 50 && rawSize[1] >= 50 ? rawSize : [150, 100];
        const [minX, minY, maxX, maxY] = pyramid.extent;
        const [ominX, ominY, omaxX, omaxY] = view.calculateExtent(size);
        return {
            // does the overview contain the whole image extent?
            contains: ominX <= minX + 1 && ominY <= minY + 1 && omaxX >= maxX - 1 && omaxY >= maxY - 1,
            // is it fitted (not a zoomed crop): the image spans most of the box
            fillX: (maxX - minX) / view.getResolution() / size[0],
            fillY: (maxY - minY) / view.getResolution() / size[1],
            // the fit lands on a fractional zoom of the pyramid ladder
            resolutions: view.getResolutions()?.length ?? 0,
        };
    });

    expect(minimap).not.toBeNull();
    expect(minimap!.contains).toBe(true);
    expect(minimap!.fillX).toBeGreaterThan(0.9);
    expect(minimap!.fillY).toBeGreaterThan(0.9);
    // ladder with the R0 floor below default zoom 0 (maxZoom 2 + shift + floor)
    expect(minimap!.resolutions).toBe(4);
});
