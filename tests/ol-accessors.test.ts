import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * The public OpenLayers accessors: consumers get the internal objects the
 * viewer keeps private (base/overlay/minimap layers, route lines, markers)
 * without reaching through an underscore field. `storymap.map` itself stays
 * the raw `ol/Map`.
 */
describe("OpenLayers accessors", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymapWith(id: string, options: Record<string, unknown>): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(id, {
            storymap: {
                slides: [{ date: "", type: "overview", text: { headline: "Overview", text: "" } }],
                ...options,
            },
        } as unknown as StorymapDataWrapper);
    }

    function storymap(id: string): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        const data = {
            storymap: {
                map_type: "osm",
                overlays: [
                    { map_type: "https://tiles.example.com/a/{z}/{x}/{y}.png" },
                    { map_type: "https://tiles.example.com/b/{z}/{x}/{y}.png" },
                ],
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Paris", text: "" },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                    {
                        date: "",
                        text: { headline: "Rome", text: "" },
                        location: { lat: 41.9, lon: 12.5 },
                    },
                ],
            },
        };
        return new StoryMap(id, data as unknown as StorymapDataWrapper);
    }

    it("exposes the base layer and the overlay layers in order", () => {
        const sm = storymap("sm-acc-layers");
        const base = sm.getBaseLayer();
        expect(base).not.toBeNull();
        expect(typeof base?.getSource).toBe("function");

        const overlays = sm.getOverlayLayers();
        expect(overlays).toHaveLength(2);
        expect(sm.getOverlayLayer(0)).toBe(overlays[0]);
        expect(sm.getOverlayLayer(1)).toBe(overlays[1]);
        // out of range is null, not undefined
        expect(sm.getOverlayLayer(9)).toBeNull();
    });

    it("exposes the route line layers and the markers by slide index", () => {
        const sm = storymap("sm-acc-lines");
        expect(sm.getLine()).not.toBeNull();
        expect(sm.getLineActive()).not.toBeNull();

        const markers = sm.getMarkers();
        expect(markers).toHaveLength(3);
        expect(sm.getMarker(1)).toBe(markers[1]);
        expect(sm.getMarker(9)).toBeNull();
    });

    it("keeps storymap.map as the raw OpenLayers map", () => {
        const sm = storymap("sm-acc-map");
        // the accessors and the raw map are the same object graph: the base
        // layer handed out is the one on the OL map
        const base = sm.getBaseLayer();
        expect(base).not.toBeNull();
        expect(sm.map?.getLayers().getArray()).toContain(base);
    });

    it("distinguishes image space from a georeferenced IIIF map", () => {
        // image space: the IIIF image *is* the map
        const as_image = storymapWith("sm-acc-image-space", {
            map_type: "iiif",
            map_as_image: true,
            iiif: { url: "https://example.com/iiif/image/info.json" },
        });
        expect(as_image.isImageSpace()).toBe(true);

        // georeferenced: the same image type, but placed on the globe
        const georeferenced = storymapWith("sm-acc-geo-iiif", {
            map_type: "iiif",
            map_bbox: [-5, 45, 10, 55],
            iiif: { url: "https://example.com/iiif/image/info.json" },
        });
        expect(georeferenced.isImageSpace()).toBe(false);

        // plain tile maps are never image space
        expect(storymap("sm-acc-osm-space").isImageSpace()).toBe(false);
    });

    it("exposes a real ol/Map on storymap.map, never a stub", () => {
        const el = document.createElement("div");
        el.id = "sm-acc-null";
        document.body.appendChild(el);
        const sm = new StoryMap("sm-acc-null", {
            storymap: { map_type: "osm", slides: [] },
        } as unknown as StorymapDataWrapper);
        // an inline document builds synchronously, so this observes a real
        // map. The null half of the contract belongs to mapless stories and
        // is pinned by tests/no-map.test.ts, not here.
        expect(sm.map).not.toBeNull();
        expect(typeof sm.map?.getView).toBe("function");
    });

    it("exposes the minimap after it is built", () => {
        const sm = storymap("sm-acc-mini");
        // jsdom never fires tile loadend, so build it explicitly
        sm.createMiniMap();
        const minimap = sm.getMinimap();
        expect(minimap).not.toBeNull();
        expect(typeof minimap?.getView().getCenter).toBe("function");
    });
});
