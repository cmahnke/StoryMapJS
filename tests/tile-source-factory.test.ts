import { beforeAll, describe, expect, it } from "vitest";
import { Tile as TileLayer } from "ol/layer";
import { OSM, XYZ } from "ol/source";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

type LayerProbe = {
    getSource(): { constructor: { name: string } } | null;
};

function layersOf(storymap: StoryMap): LayerProbe[] {
    const inner = (
        storymap as unknown as { _map: { _map: { getLayers(): { getArray(): LayerProbe[] } } } }
    )._map._map;
    return inner.getLayers().getArray();
}

function container(id: string): void {
    const el = document.createElement("div");
    el.id = id;
    document.body.appendChild(el);
}

function data(mapType = "osm"): StorymapDataWrapper {
    return {
        storymap: {
            map_type: mapType,
            slides: [
                { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                {
                    date: "",
                    text: { headline: "Paris", text: "" },
                    location: { lat: 48.85, lon: 2.35 },
                },
            ],
        },
    } as unknown as StorymapDataWrapper;
}

/**
 * KNOWN ISSUE #473 — "Add more map providers"
 *
 * The `tile_source_factory` option lets consumers inject custom OpenLayers
 * tile layers/sources (e.g. WMS) for any `map_type` value, covering the
 * base layer, overlays and minimap, which all funnel through the tile
 * layer factory.
 */
describe("known issue #473: tile_source_factory", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    it("uses the factory layer for matching map types", () => {
        container("sm-473-hit");
        const custom = new TileLayer({ source: new OSM() });
        const seen: string[] = [];
        const storymap = new StoryMap("sm-473-hit", data("wms:flood"), {
            tile_source_factory: (map_type) => {
                seen.push(map_type);
                return map_type.startsWith("wms:") ? custom : undefined;
            },
        });
        expect(seen).toContain("wms:flood");
        expect(layersOf(storymap)).toContain(custom);
    });

    it("wraps a bare Source in a TileLayer", () => {
        container("sm-473-source");
        const source = new XYZ({ url: "https://tiles.example.com/{z}/{x}/{y}.png" });
        const storymap = new StoryMap("sm-473-source", data("custom:tiles"), {
            tile_source_factory: () => source,
        });
        const wrapped = layersOf(storymap).find(
            (layer) => (layer as unknown as TileLayer).getSource?.() === source,
        );
        expect(wrapped).toBeDefined();
    });

    it("falls through to the default types when the factory declines", () => {
        container("sm-473-miss");
        const storymap = new StoryMap("sm-473-miss", data("wms:flood"), {
            tile_source_factory: () => undefined,
        });
        const sources = layersOf(storymap).map((layer) =>
            (layer as unknown as TileLayer).getSource?.(),
        );
        expect(sources.some((source) => source instanceof OSM)).toBe(true);
    });

    it("supports delegation via createDefault", () => {
        container("sm-473-delegate");
        const storymap = new StoryMap("sm-473-delegate", data(), {
            map_type: "osm",
            tile_source_factory: (_map_type, { createDefault }) => createDefault(),
        });
        const sources = layersOf(storymap).map((layer) =>
            (layer as unknown as TileLayer).getSource?.(),
        );
        expect(sources.some((source) => source instanceof OSM)).toBe(true);
    });
});
