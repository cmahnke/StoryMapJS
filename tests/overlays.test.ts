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
    const inner = (
        storymap as unknown as { _map: { _map: { getLayers(): { getArray(): LayerProbe[] } } } }
    )._map._map;
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

/**
 * `overlays` and `overview_extent` live in the map's option defaults, but
 * storymap JSON reaches the viewer through StoryMap's options: updateData
 * only copies keys the target already has, so both must be declared there
 * too or the data is silently dropped.
 */
describe("overlays from storymap data", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    it("applies overlays and overview_extent carried by the storymap JSON", () => {
        const el = document.createElement("div");
        el.id = "sm-overlays-from-data";
        document.body.appendChild(el);
        const data = {
            storymap: {
                map_type: "osm",
                overview_extent: [5, 50, 6, 51],
                overlays: [
                    { map_type: "https://tiles.example.org/a/{z}/{x}/{y}.png", opacity: 0.4 },
                ],
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
        const storymap = new StoryMap(el.id, data as unknown as StorymapDataWrapper, {}, {});
        expect(vcoMap(storymap).getOverlayCount()).toBe(1);
        expect(
            (storymap as unknown as { options: { overview_extent: number[] } }).options
                .overview_extent,
        ).toEqual([5, 50, 6, 51]);
    });
});

/**
 * A georeferenced overlay places a IIIF image on the geographic map from
 * Georeference Extension ground control points instead of stacking a tile
 * source (`overlays[].georeference`, a manifest-only feature).
 */
describe("georeferenced overlays", () => {
    const GCP_BODY = {
        type: "FeatureCollection",
        transformation: { type: "polynomial", options: { order: 1 } },
        features: [
            { properties: { resourceCoords: [0, 0] }, geometry: { coordinates: [4.45, 51.92] } },
            {
                properties: { resourceCoords: [2315, 0] },
                geometry: { coordinates: [4.5, 51.92] },
            },
            {
                properties: { resourceCoords: [2315, 3000] },
                geometry: { coordinates: [4.5, 51.9] },
            },
            {
                properties: { resourceCoords: [0, 3000] },
                geometry: { coordinates: [4.45, 51.9] },
            },
        ],
    };

    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
        // the info.json fetch is not what these tests are about
        (globalThis as Record<string, unknown>).fetch = () =>
            Promise.reject(new Error("offline in unit tests"));
    });

    function storymapWithOverlays(id: string, overlays: unknown[]): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        const data = {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Rotterdam", text: "" },
                        location: { lat: 51.91, lon: 4.48 },
                    },
                ],
            },
        };
        return new StoryMap(
            id,
            data as unknown as StorymapDataWrapper,
            {
                overlays,
            } as unknown as ConstructorParameters<typeof StoryMap>[2],
        );
    }

    it("places a sheet from its ground control points", () => {
        const storymap = storymapWithOverlays("sm-overlays-georeference", [
            {
                georeference: {
                    url: "https://iiif.example.org/image1",
                    width: 2315,
                    height: 3000,
                    body: GCP_BODY,
                },
                opacity: 0.75,
                attribution: "Placed sheet",
            },
        ]);
        expect(vcoMap(storymap).getOverlayCount()).toBe(1);
        // the layer is a plain tile layer: presentation still applies, and
        // the source (a reprojected IIIF source) attaches asynchronously
        const layers = layersOf(storymap);
        const tiles = layers.filter((l) => typeof l.getSource()?.getFeatures !== "function");
        expect(tiles[1]?.getOpacity()).toBe(0.75);
        expect(tiles[1]?.getZIndex()).toBe(1);
    });

    it("skips placements it cannot draw, keeping the other layers", () => {
        const warnings: string[] = [];
        const warn = console.warn;
        console.warn = (...args: unknown[]) => {
            warnings.push(args.map(String).join(" "));
        };
        try {
            const storymap = storymapWithOverlays("sm-overlays-georeference-skip", [
                {
                    georeference: {
                        url: "https://iiif.example.org/warped",
                        width: 2315,
                        height: 3000,
                        body: { ...GCP_BODY, transformation: { type: "thinPlateSpline" } },
                    },
                    attribution: "Warped sheet",
                },
                { map_type: "https://tiles.example.org/plain/{z}/{x}/{y}.png" },
            ]);
            expect(vcoMap(storymap).getOverlayCount()).toBe(1);
            expect(warnings.join("\n")).toContain("thinPlateSpline");
        } finally {
            console.warn = warn;
        }
    });

    it("skips an entry with neither map_type nor georeference", () => {
        const warnings: string[] = [];
        const warn = console.warn;
        console.warn = (...args: unknown[]) => {
            warnings.push(args.map(String).join(" "));
        };
        try {
            const storymap = storymapWithOverlays("sm-overlays-empty-entry", [
                { opacity: 0.5 },
                { map_type: "https://tiles.example.org/plain/{z}/{x}/{y}.png" },
            ]);
            expect(vcoMap(storymap).getOverlayCount()).toBe(1);
            expect(warnings.join("\n")).toContain("neither map_type nor georeference");
        } finally {
            console.warn = warn;
        }
    });
});
