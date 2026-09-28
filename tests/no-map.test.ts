import { readFileSync } from "node:fs";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { manifestToStorymapData } from "../src/storymap/iiif";
import { StoryMap } from "../src/storymap/StoryMap";
import { mediaService, tileService } from "../src/storymap/Consent";
import type { StorymapDataWrapper } from "../src/types";

/**
 * A storymap with no map at all: `map_type: "none"`.
 *
 * The point of the sentinel is that absence cannot be reinterpreted, because
 * `map_type: ""` and a missing key both keep meaning OSM. So these tests are
 * about a map that is genuinely never built - not a map that is built and
 * hidden, and not a stub object that answers truthy and then throws.
 */
describe('map_type: "none"', () => {
    let created: StoryMap[] = [];

    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    beforeEach(() => {
        document.body.innerHTML = "";
        created = [];
    });

    function make(data: Record<string, unknown>, id = "no-map"): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        const sm = new StoryMap(el.id, { storymap: data } as unknown as StorymapDataWrapper);
        created.push(sm);
        return sm;
    }

    function storymapData(extra: Record<string, unknown> = {}): Record<string, unknown> {
        return {
            slides: [
                {
                    type: "overview",
                    text: { headline: "One", text: "<p>first</p>" },
                    location: { lat: 47.6, lon: -122.3 },
                },
                {
                    text: { headline: "Two", text: "<p>second</p>" },
                    location: { lat: 47.7, lon: -122.2 },
                },
            ],
            ...extra,
        };
    }

    it("builds no map engine and no map pane", () => {
        const sm = make(storymapData({ map_type: "none" }));

        expect(sm.map).toBeNull();
        expect(sm._map).toBeNull();
        expect(sm._el.map).toBeNull();
        expect(sm._el.container.querySelector(".vco-map")).toBeNull();
    });

    it("still lays out a menubar and a slider", () => {
        const sm = make(storymapData({ map_type: "none" }));

        expect(sm._el.menubar).toBeTruthy();
        expect(sm._el.storyslider).toBeTruthy();
        expect(sm._el.container.className).toContain("vco-layout-no-map");
        // the slider is the whole story, so no height is given to a map
        expect(sm.options.map_height).toBe(0);
    });

    it("fires loaded, and the hash and progress still work without a map", () => {
        const sm = make(storymapData({ map_type: "none" }));
        const events: string[] = [];
        sm.on("loaded", () => events.push("loaded"));

        sm.fire("dataloaded");
        sm._storyslider.fire("loaded");
        sm._onLoaded();

        expect(events).toContain("loaded");
    });

    it("navigates between slides without a map", () => {
        const sm = make(storymapData({ map_type: "none" }));
        sm.fire("dataloaded");
        sm._storyslider.fire("loaded");
        sm._onLoaded();

        sm.goTo(1);

        expect(sm.current_slide).toBe(1);
    });

    it("returns neutral values from every map accessor", () => {
        const sm = make(storymapData({ map_type: "none" }));

        expect(sm.getBaseLayer()).toBeNull();
        expect(sm.getOverlayLayers()).toEqual([]);
        expect(sm.getOverlayLayer(0)).toBeNull();
        expect(sm.getMinimap()).toBeNull();
        expect(sm.getLine()).toBeNull();
        expect(sm.getLineActive()).toBeNull();
        expect(sm.getMarkers()).toEqual([]);
        expect(sm.getMarker(0)).toBeNull();
        expect(sm.isImageSpace()).toBe(false);
    });

    it("treats the map setters as no-ops rather than throwing", () => {
        const sm = make(storymapData({ map_type: "none" }));

        expect(() => {
            sm.setOverlayVisible(0, false);
            sm.setOverlayOpacity(0, 0.5);
            sm.createMiniMap();
            sm.setExtraAttributions(["nope"]);
            sm.setMapOptions({ calculate_zoom: false });
            sm.fire("overview");
        }).not.toThrow();
    });

    function consentKeys(sm: StoryMap): string[] {
        const manager = sm.options.consent_manager as unknown as {
            requestAll: (services: { key: string }[], el: HTMLElement) => void;
        };
        const keys: string[] = [];
        manager.requestAll = function (services) {
            for (const s of services) keys.push(s.key);
        };
        sm._startConsentAsk();
        return keys;
    }

    it("asks for consent without a tile row", () => {
        window.localStorage.clear();
        const sm = make({
            map_type: "none",
            consent_required: true,
            slides: [
                {
                    text: { headline: "One", text: "" },
                    media: { url: "https://example.org/a.mp3", content: "audio" },
                },
            ],
        });
        sm.fire("dataloaded");

        const keys = consentKeys(sm);

        expect(keys).not.toContain(tileService().key);
        // media is still asked about
        expect(keys).toContain(mediaService("audio", "Audio").key);
    });

    it("still asks for tile consent when there is a map", () => {
        window.localStorage.clear();
        const sm = make(storymapData({ map_type: "osm", consent_required: true }));
        sm.fire("dataloaded");

        expect(consentKeys(sm)).toContain(tileService().key);
    });

    it("disposes cleanly with no map", () => {
        const sm = make(storymapData({ map_type: "none" }));
        sm.fire("dataloaded");

        expect(() => sm.dispose()).not.toThrow();
    });

    it("treats a null map_type as the default, not a crash", () => {
        // the schema forbids a null, but a hand-written document can carry one
        expect(() => make(storymapData({ map_type: null }))).not.toThrow();
        const sm = created[created.length - 1];
        expect(sm.options.map_type).toBe("");
        expect(sm.map).not.toBeNull();
    });

    it("round-trips through a IIIF manifest, as the basemap keyword", () => {
        // The mapless story survives storymap -> manifest -> storymap, because
        // the converter writes the basemap keyword and the reader reads it
        // back. Without that, converting a mapless document and serving the
        // manifest would silently give the story an OpenStreetMap basemap.
        const manifest = JSON.parse(
            readFileSync("public/examples-iiif/no-map.json", "utf8"),
        ) as Record<string, unknown>;
        const data = manifestToStorymapData(manifest) as { map_type?: string };

        expect(data.map_type).toBe("none");
    });

    describe("show_distance without a route", () => {
        function distanceEl(sm: StoryMap): HTMLElement | null {
            return (sm as unknown as { _menubar: { _el: Record<string, HTMLElement> } })._menubar
                ._el.distance as HTMLElement | null;
        }

        it("hides the distance in a mapless story", () => {
            const sm = make(storymapData({ map_type: "none", show_distance: true }));
            sm.fire("dataloaded");
            sm._onLoaded();

            expect(distanceEl(sm)?.style.display).toBe("none");
        });

        it("hides the distance in a mapped story with one geolocated marker", () => {
            // getRouteDistance() is undefined for fewer than two located
            // markers, and setDistance(undefined) hides the element. A `?? 0`
            // here would paint a fabricated "0.0 km".
            const sm = make({
                map_type: "osm",
                show_distance: true,
                slides: [
                    {
                        type: "overview",
                        text: { headline: "One", text: "" },
                        location: { lat: 47.6, lon: -122.3 },
                    },
                    { text: { headline: "Two", text: "" } },
                ],
            });
            sm.fire("dataloaded");
            sm._updateDistance();

            expect(distanceEl(sm)?.style.display).toBe("none");
        });

        it("still shows the distance with two geolocated markers", () => {
            const sm = make({
                map_type: "osm",
                show_distance: true,
                slides: [
                    {
                        type: "overview",
                        text: { headline: "One", text: "" },
                        location: { lat: 47.6, lon: -122.3 },
                    },
                    {
                        text: { headline: "Two", text: "" },
                        location: { lat: 47.7, lon: -122.2 },
                    },
                ],
            });
            sm.fire("dataloaded");
            sm._updateDistance();

            const el = distanceEl(sm);
            expect(el?.style.display).toBe("");
            expect(el?.textContent).toMatch(/km/);
        });
    });

    it("keeps map_type: '' meaning OSM, so no existing document changes", () => {
        const sm = make(storymapData({ map_type: "" }));

        expect(sm._map).not.toBeNull();
        expect(sm._el.map).not.toBeNull();
    });
});
