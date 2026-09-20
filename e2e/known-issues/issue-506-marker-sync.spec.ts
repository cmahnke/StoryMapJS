import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #506 — "Visual glitches" (markers/paths decoupled from the map,
 * moving independently during transitions)
 * FIXED: DOM marker overlays are positioned by OpenLayers per frame — after
 * panning the map, every marker tracks exactly its projected coordinate.
 */
test("issue #506: markers track the map while panning", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2000);

    // pan the map by 120px and compare the marker's pixel movement with the
    // movement of its projected coordinate
    const result = await page.evaluate(async () => {
        const sm = window as unknown as {
            __sm?: {
                _map?: {
                    _markers: {
                        data: { real_marker: boolean };
                        _marker: HTMLElement;
                        _overlay?: { getPosition(): number[] | undefined };
                    }[];
                    _map: {
                        getPixelFromCoordinate(c: number[]): number[];
                        getView(): {
                            setCenter(c: number[]): void;
                            getCenter(): number[];
                            getResolution(): number | undefined;
                        };
                        getSize(): number[];
                    };
                };
            };
        };
        const map = sm.__sm?._map;
        const marker = map?._markers?.find((m) => m.data.real_marker && m._marker);
        const overlay = marker?._overlay;
        if (!map || !marker || !overlay) return null;

        const mapRect = document.querySelector("#storymap-embed .vco-map")!.getBoundingClientRect();
        const markerRect = () => {
            const r = marker._marker.getBoundingClientRect();
            return { x: r.x, y: r.y + r.height }; // pin tip
        };

        const pos = overlay.getPosition()!;
        const proj0 = map._map.getPixelFromCoordinate(pos);
        const dom0 = markerRect();

        const center = map._map.getView().getCenter();
        const resolution = map._map.getView().getResolution() ?? 1;
        map._map.getView().setCenter([center[0] - 360 * resolution, center[1]]);
        await new Promise((r) => setTimeout(r, 300));

        const proj1 = map._map.getPixelFromCoordinate(pos);
        const dom1 = markerRect();

        return {
            domDeltaX: dom1.x - dom0.x,
            projDeltaX: proj1[0] - proj0[0],
            domDeltaY: dom1.y - dom0.y,
            projDeltaY: proj1[1] - proj0[1],
            mapLeft: mapRect.x,
        };
    });

    expect(result).not.toBeNull();
    // both the DOM marker and the projection must have moved by ~360px
    expect(Math.abs(result!.domDeltaX - result!.projDeltaX)).toBeLessThanOrEqual(2);
    expect(Math.abs(result!.domDeltaY - result!.projDeltaY)).toBeLessThanOrEqual(2);
    expect(Math.abs(result!.projDeltaX)).toBeGreaterThan(100);
});
