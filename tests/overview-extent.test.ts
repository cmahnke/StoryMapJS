import { beforeAll, describe, expect, it } from "vitest";
import { boundingExtent } from "ol/extent";
import { fromLonLat } from "ol/proj";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

type OverviewView = {
    getCenter(): number[] | undefined;
    fit(extent: number[], options: { size: number[] }): void;
};

function overviewView(storymap: StoryMap): OverviewView {
    const vcoMap = (
        storymap as unknown as {
            _map: {
                _createMiniMap(): void;
                _mini_map: { getOverviewMap(): { getView(): OverviewView } } | null;
            };
        }
    )._map;
    // jsdom never fires tile loadend, so build the minimap directly
    vcoMap._createMiniMap();
    return vcoMap._mini_map?.getOverviewMap().getView() as OverviewView;
}

describe("overview_extent", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymapWithMini(id: string, options?: Record<string, unknown>): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        const data: Record<string, unknown> = {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Paris", text: "" },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                ],
            },
        };
        return new StoryMap(id, data as unknown as StorymapDataWrapper, {
            map_mini: true,
            ...(options ?? {}),
        });
    }

    it("leaves the overview unconstrained by default", () => {
        const view = overviewView(storymapWithMini("sm-overview-default"));
        // fitting the whole world centers the unconstrained view on it
        view.fit([-20037508, -20037508, 20037508, 20037508], { size: [150, 100] });
        expect(view.getCenter()?.[0]).toBeCloseTo(0, -2);
    });

    it("constrains the overview to the lon/lat box", () => {
        const view = overviewView(storymapWithMini("sm-overview-box", { overview_extent: [5, 50, 6, 51] }));
        // fitting the whole world clamps the constrained view into the box
        view.fit([-20037508, -20037508, 20037508, 20037508], { size: [150, 100] });
        const center = view.getCenter() ?? [];
        const box = boundingExtent([fromLonLat([5, 50]), fromLonLat([6, 51])]);
        expect(center[0]).toBeGreaterThanOrEqual(box[0]);
        expect(center[1]).toBeGreaterThanOrEqual(box[1]);
        expect(center[0]).toBeLessThanOrEqual(box[2]);
        expect(center[1]).toBeLessThanOrEqual(box[3]);
    });
});
