import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

type LayerProbe = {
    getZIndex(): number | undefined;
    getSource(): { getFeatures?: () => unknown[] } | null;
};

function layersOf(storymap: StoryMap): LayerProbe[] {
    const inner = (storymap as unknown as { _map: { _map: { getLayers(): { getArray(): LayerProbe[] } } } })
        ._map._map;
    return inner.getLayers().getArray();
}

function tileZIndexes(probes: LayerProbe[]): (number | undefined)[] {
    return probes
        .filter((l) => typeof l.getSource()?.getFeatures !== "function")
        .map((l) => l.getZIndex());
}

function lineZIndexes(probes: LayerProbe[]): (number | undefined)[] {
    return probes
        .filter((l) => typeof l.getSource()?.getFeatures === "function")
        .map((l) => l.getZIndex());
}

describe("tile layer switches", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymapWithAttribution(id: string): { storymap: StoryMap; root: HTMLElement } {
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
        const storymap = new StoryMap(id, data as unknown as StorymapDataWrapper);
        return { storymap, root: el };
    }

    function attribution(root: HTMLElement): string {
        return root.querySelector(".vco-map-attribution")?.textContent ?? "";
    }

    it("refreshes the attribution line on every map_type switch", () => {
        const { storymap, root } = storymapWithAttribution("sm-layers-attribution");
        expect(attribution(root)).toContain("OpenStreetMap");
        storymap.setMapOption("map_type", "https://tiles.example.com/{z}/{x}/{y}.png");
        expect(attribution(root)).toContain("StoryMapJS");
        expect(attribution(root)).not.toContain("OpenStreetMap");
        storymap.setMapOption("map_type", "osm");
        expect(attribution(root)).toContain("OpenStreetMap");
    });

    it("keeps route lines above fresh tile layers", () => {
        const { storymap } = storymapWithAttribution("sm-layers-zorder");
        const before = layersOf(storymap);
        expect(tileZIndexes(before)).toEqual([0]);
        expect(Math.min(...(lineZIndexes(before) as number[]))).toBeGreaterThan(0);
        storymap.setMapOption("map_type", "https://tiles.example.com/{z}/{x}/{y}.png");
        const after = layersOf(storymap);
        expect(tileZIndexes(after)).toEqual([0]);
        expect(Math.min(...(lineZIndexes(after) as number[]))).toBeGreaterThan(0);
    });

    it("appends extra attributions without touching the base credit", () => {
        const { storymap, root } = storymapWithAttribution("sm-layers-extra");
        const vcoMap = (storymap as unknown as { _map: { setExtraAttributions(p: string[]): void } })
            ._map;
        vcoMap.setExtraAttributions(["Historic overlay, public domain"]);
        expect(attribution(root)).toContain("OpenStreetMap");
        expect(attribution(root)).toContain("Historic overlay, public domain");
        vcoMap.setExtraAttributions([]);
        expect(attribution(root)).not.toContain("Historic overlay");
    });
});
