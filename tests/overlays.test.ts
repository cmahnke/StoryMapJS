import { beforeAll, describe, expect, it } from "vitest";
import { boundingExtent } from "ol/extent";
import { fromLonLat } from "ol/proj";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

type VcoMap = {
    getOverlayCount(): number;
    setOverlayVisible(index: number, visible: boolean): void;
    setOverlayOpacity(index: number, opacity: number): void;
};

type LayerProbe = {
    getZIndex(): number | undefined;
    getOpacity(): number;
    getVisible(): boolean;
    getClassName(): string;
    getExtent(): number[] | undefined;
    getSource(): { getFeatures?: () => unknown[] } | null;
};

function vcoMap(storymap: StoryMap): VcoMap {
    return (storymap as unknown as { _map: VcoMap })._map;
}

function layersOf(storymap: StoryMap): LayerProbe[] {
    const inner = (storymap as unknown as { _map: { _map: { getLayers(): { getArray(): LayerProbe[] } } } })
        ._map._map;
    return inner.getLayers().getArray();
}

describe("stacked overlays", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymapWithOverlays(id: string): { storymap: StoryMap; root: HTMLElement } {
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
        const storymap = new StoryMap(id, data as unknown as StorymapDataWrapper, {
            overlays: [
                {
                    map_type: "https://tiles.example.com/base/{z}/{x}/{y}.png",
                    opacity: 0.8,
                    attribution: "Base overlay credit",
                },
                {
                    map_type: "https://tiles.example.com/top/{z}/{x}/{y}.png",
                    visible: false,
                    className: "test-overlay",
                    blendMode: "multiply",
                    extent: [5, 50, 6, 51],
                    attribution: "Top overlay credit",
                },
            ],
        });
        return { storymap, root: el };
    }

    function attribution(root: HTMLElement): string {
        return root.querySelector(".vco-map-attribution")?.textContent ?? "";
    }

    it("stacks overlays between base tiles and route lines", () => {
        const { storymap } = storymapWithOverlays("sm-overlays-stack");
        expect(vcoMap(storymap).getOverlayCount()).toBe(2);
        const layers = layersOf(storymap);
        const tiles = layers.filter((l) => typeof l.getSource()?.getFeatures !== "function");
        const lines = layers.filter((l) => typeof l.getSource()?.getFeatures === "function");
        expect(tiles.map((l) => l.getZIndex())).toEqual([0, 1, 2]);
        for (const line of lines) {
            expect(line.getZIndex()).toBeGreaterThan(2);
        }
    });

    it("applies per-layer presentation from the entries", () => {
        const { storymap } = storymapWithOverlays("sm-overlays-presentation");
        const layers = layersOf(storymap);
        const tiles = layers.filter((l) => typeof l.getSource()?.getFeatures !== "function");
        expect(tiles[1]?.getOpacity()).toBe(0.8);
        expect(tiles[2]?.getVisible()).toBe(false);
        expect(tiles[2]?.getClassName()).toBe("test-overlay");
        expect(tiles[2]?.getExtent()).toEqual(
            boundingExtent([fromLonLat([5, 50]), fromLonLat([6, 51])]),
        );
    });

    it("toggles visibility and syncs attribution", () => {
        const { storymap, root } = storymapWithOverlays("sm-overlays-visibility");
        expect(attribution(root)).toContain("Base overlay credit");
        expect(attribution(root)).not.toContain("Top overlay credit");
        vcoMap(storymap).setOverlayVisible(1, true);
        expect(attribution(root)).toContain("Top overlay credit");
        vcoMap(storymap).setOverlayVisible(0, false);
        expect(attribution(root)).not.toContain("Base overlay credit");
        expect(attribution(root)).toContain("OpenStreetMap");
        vcoMap(storymap).setOverlayOpacity(1, 0.5);
        const layers = layersOf(storymap);
        const tiles = layers.filter((l) => typeof l.getSource()?.getFeatures !== "function");
        expect(tiles[2]?.getOpacity()).toBe(0.5);
    });

    it("rebuilds overlays through setMapOption", () => {
        const { storymap } = storymapWithOverlays("sm-overlays-rebuild");
        expect(vcoMap(storymap).getOverlayCount()).toBe(2);
        storymap.setMapOption("overlays", [
            { map_type: "https://tiles.example.com/solo/{z}/{x}/{y}.png" },
        ]);
        expect(vcoMap(storymap).getOverlayCount()).toBe(1);
    });
});
