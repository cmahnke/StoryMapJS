import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * The `map_area` option (landscape): `"full"` (default) spans the map over
 * the whole width with the slide panel fading in over it (the view is
 * offset so markers clear the panel); `"left"` limits the map element to
 * the left, visible half with an opaque slide panel — no view offset, fits
 * and `map_bbox` constraints align with the visible area directly.
 */
const bbox = [-88, 24, -80, 31];

interface HarnessWindow {
    __sm?: {
        options?: {
            map_center_offset?: { left: number; top: number } | null;
        };
        _map?: {
            _map?: {
                getView(): {
                    getCenter(): number[];
                    setZoom(z: number): void;
                    setCenter(c: number[]): void;
                    get(prop: string): unknown;
                };
            };
        };
    };
}

test("map_area left renders the map at the visible half with an opaque panel", async ({
    page,
}) => {
    await page.goto(harnessUrl("katrina", { map_area: "left" }));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const state = await page.evaluate(() => {
        const sm = (window as unknown as HarnessWindow).__sm;
        const mapRect = document.querySelector("#storymap-embed .vco-map")!.getBoundingClientRect();
        const sliderRect = document.querySelector(
            "#storymap-embed .vco-storyslider",
        )!.getBoundingClientRect();
        const container = document.querySelector("#storymap-embed.vco-storymap")!;
        return {
            mapWidth: Math.round(mapRect.width),
            containerWidth: Math.round(container.getBoundingClientRect().width),
            sliderStartsAtMapEdge: Math.abs(sliderRect.x - mapRect.right) < 2,
            sliderBackgroundHidden:
                getComputedStyle(document.querySelector("#storymap-embed .vco-slider-background")!)
                    .display === "none",
            hasLeftClass: container.className.includes("vco-map-area-left"),
            offset: sm?.options?.map_center_offset,
        };
    });

    expect(state.hasLeftClass).toBe(true);
    expect(state.mapWidth).toBeCloseTo(state.containerWidth / 2, -1);
    expect(state.sliderStartsAtMapEdge).toBe(true);
    expect(state.sliderBackgroundHidden).toBe(true);
    expect(state.offset).toEqual({ left: 0, top: 0 });
});

test("map_area full keeps the default layout and offset", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const state = await page.evaluate(() => {
        const sm = (window as unknown as HarnessWindow).__sm;
        const mapRect = document.querySelector("#storymap-embed .vco-map")!.getBoundingClientRect();
        const container = document.querySelector("#storymap-embed.vco-storymap")!;
        return {
            mapWidth: Math.round(mapRect.width),
            containerWidth: Math.round(container.getBoundingClientRect().width),
            offset: sm?.options?.map_center_offset,
            hasLeftClass: container.className.includes("vco-map-area-left"),
        };
    });

    expect(state.hasLeftClass).toBe(false);
    expect(state.mapWidth).toBe(state.containerWidth);
    expect(state.offset!.left).toBeLessThan(0);
});

test("map_area left with map_bbox composes the active marker in the map area", async ({
    page,
}) => {
    await page.goto(
        harnessUrl("katrina", { map_area: "left", map_bbox: bbox }),
    );
    await waitForStoryMap(page);
    await page.waitForTimeout(3000);

    const state = await page.evaluate(() => {
        const sm = (window as unknown as HarnessWindow).__sm;
        const mapRect = document.querySelector("#storymap-embed .vco-map")!.getBoundingClientRect();
        const overlays = [
            ...document.querySelectorAll("#storymap-embed .ol-overlaycontainer .vco-mapmarker"),
        ].map((el) => {
            const r = el.getBoundingClientRect();
            return Math.round(r.x - mapRect.x);
        });
        const v = sm?._map?._map?.getView();
        const extent = v?.get("extent");
        return {
            // the view center stays within the bbox (projected corners)
            center: v?.getCenter(),
            extent: Array.isArray(extent) ? (extent as number[]) : null,
            overlayX: overlays,
        };
    });

    expect(state.extent).not.toBeNull();
    const [minX, , maxX] = state.extent!;
    // constrainOnlyCenter: the center is clamped into the box
    expect(state.center![0]).toBeGreaterThanOrEqual(minX);
    expect(state.center![0]).toBeLessThanOrEqual(maxX);
    // the fit composes the route across the (half-width) map: in-box
    // markers land inside the map element, no spill under the panel
    const inMap = state.overlayX.filter((x) => x >= -40 && x <= 640).length;
    expect(inMap).toBeGreaterThanOrEqual(4);
});

test("map_bbox clamps the view center in both map areas", async ({ page }) => {
    for (const options of [{ map_bbox: bbox }, { map_area: "left", map_bbox: bbox }]) {
        await page.goto(harnessUrl("katrina", options));
        await waitForStoryMap(page);
        await page.waitForTimeout(2500);

        await page.evaluate(() => {
            const v = (window as unknown as HarnessWindow).__sm!._map!._map!.getView();
            v.setZoom(12);
            v.setCenter([10_000_000, 9_000_000]); // far outside
        });
        await page.waitForTimeout(800);

        const view = await page.evaluate(() => {
            const v = (window as unknown as HarnessWindow).__sm!._map!._map!.getView();
            const extent = v.get("extent");
            return {
                center: v.getCenter(),
                extent: Array.isArray(extent) ? (extent as number[]) : null,
            };
        });
        const [minX, minY, maxX, maxY] = view.extent!;
        expect(view.center[0]).toBeGreaterThanOrEqual(minX);
        expect(view.center[0]).toBeLessThanOrEqual(maxX);
        expect(view.center[1]).toBeGreaterThanOrEqual(minY);
        expect(view.center[1]).toBeLessThanOrEqual(maxY);
    }
});
