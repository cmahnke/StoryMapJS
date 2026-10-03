import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type OpenLayersMap from "../src/map/openlayers/Map.OpenLayers";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Provider credits in both renderings: the linked HTML on
 * `.vco-map-attribution` and the plain text on the tile source. A full XYZ
 * template naming a known provider must credit it — only the `osm*` map
 * type used to match, so a longhand OSM template rendered "Map data".
 */

describe("map attribution", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function credits(
        id: string,
        map_type: string,
        attribution?: string,
    ): { html: string[]; text: string[] } {
        window.location.hash = "";
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        const sm = new StoryMap(id, {
            storymap: {
                map_type,
                ...(attribution !== undefined ? { attribution } : {}),
                slides: [{ date: "", type: "overview", text: { headline: "Overview", text: "" } }],
            },
        } as unknown as StorymapDataWrapper);
        const engine = (sm as unknown as { _map: OpenLayersMap })._map;
        const out = {
            html: engine._getAttribution(engine.options.map_type),
            text: engine._sourceAttributions(engine.options.map_type),
        };
        sm.dispose();
        return out;
    }

    it("credits OSM for empty and osm: map types", () => {
        for (const [id, map_type] of [
            ["sm-attr-empty", ""],
            ["sm-attr-osm", "osm:standard"],
        ] as const) {
            const { html, text } = credits(id, map_type);
            expect(html.join(" ")).toContain("openstreetmap.org/copyright");
            expect(text.join(" ")).toContain("© OpenStreetMap contributors");
        }
    });

    it("credits a longhand OSM template and its subdomains", () => {
        for (const [id, map_type] of [
            ["sm-attr-tpl", "https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            ["sm-attr-tpl-sub", "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
        ] as const) {
            const { html, text } = credits(id, map_type);
            expect(html.join(" ")).toContain("openstreetmap.org/copyright");
            expect(text.join(" ")).toContain("© OpenStreetMap contributors");
            // the provider entry is the credit, not the generic fallback
            expect(text).not.toContain("Map data");
        }
    });

    it("keeps prefix behaviour for stadia, mapbox and esri", () => {
        expect(credits("sm-attr-stadia", "stadia").text.join(" ")).toContain("Stadia Maps");
        expect(credits("sm-attr-mapbox", "mapbox://styles/a/b").text.join(" ")).toContain(
            "© Mapbox",
        );
        expect(credits("sm-attr-esri", "ch-watercolor").text.join(" ")).toContain("Esri");
    });

    it("credits known template hosts and leaves the rest as Map data", () => {
        const carto = credits(
            "sm-attr-carto",
            "https://abc.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        );
        expect(carto.text.join(" ")).toContain("CARTO");
        const unknown = credits("sm-attr-unknown", "https://tiles.example.com/{z}/{x}/{y}.png");
        expect(unknown.text).toContain("Map data");
        const relative = credits("sm-attr-relative", "tiles/{z}/{x}/{y}.webp");
        expect(relative.text).toContain("Map data");
    });

    it("renders provider and identical author credit exactly once", () => {
        window.location.hash = "";
        const el = document.createElement("div");
        el.id = "sm-attr-dedupe";
        document.body.appendChild(el);
        const osmCredit =
            "© <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors";
        const sm = new StoryMap("sm-attr-dedupe", {
            storymap: {
                map_type: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                attribution: osmCredit,
                slides: [{ date: "", type: "overview", text: { headline: "Overview", text: "" } }],
            },
        } as unknown as StorymapDataWrapper);
        const engine = (sm as unknown as { _map: OpenLayersMap })._map;
        engine._updateAttribution();
        const line = (
            engine as unknown as { _el: Record<string, HTMLElement> }
        )._el.map.querySelector(".vco-map-attribution")?.innerHTML;
        expect(line).toContain("openstreetmap.org/copyright");
        // the provider credit and the identical author string collapse to
        // one entry instead of rendering twice (-1 keeps an absent line a
        // failure rather than a pass)
        const occurrences =
            line === undefined ? -1 : line.split("openstreetmap.org/copyright").length - 1;
        expect(occurrences).toBe(1);
        sm.dispose();
    });
});
