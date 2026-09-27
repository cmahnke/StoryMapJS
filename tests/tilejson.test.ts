import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import { manifestToStorymapData } from "../src/storymap/iiif";
import type { StorymapDataWrapper, StorymapTilejson } from "../src/types";

/**
 * TileJSON 2.1 as the map's tile source, and `storymap:basemap` as the
 * keyword alternative (interop §2.9). The old `mapType` term carried both a
 * vendor keyword and a URL template in one string, so this is the split.
 */
describe("TileJSON map configuration", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function manifestWithService(config: Record<string, unknown>) {
        return manifestToStorymapData({
            "@context": "http://iiif.io/api/presentation/3/context.json",
            service: [{ type: "Service", profile: "mapconfig", ...config }],
            items: [],
        });
    }

    describe("reading", () => {
        it("reads a full TileJSON description", () => {
            const data = manifestWithService({
                tilejson: {
                    tiles: ["https://tiles.example.org/{z}/{x}/{y}.png"],
                    minzoom: 4,
                    maxzoom: 17,
                    bounds: [-122.7, 37.1, -121.1, 38.1],
                    scheme: "tms",
                    center: [4.4777, 51.9244, 12],
                },
            });
            // the template still becomes map_type, which is what the tile
            // layer factory dispatches on
            expect(data.map_type).toBe("https://tiles.example.org/{z}/{x}/{y}.png");
            expect(data.tilejson).toEqual({
                tiles: ["https://tiles.example.org/{z}/{x}/{y}.png"],
                minzoom: 4,
                maxzoom: 17,
                bounds: [-122.7, 37.1, -121.1, 38.1],
                scheme: "tms",
                center: [4.4777, 51.9244, 12],
            });
        });

        it("reads a bare tiles string and defaults the zoom", () => {
            const data = manifestWithService({
                tilejson: { tiles: "https://tiles.example.org/{z}/{x}/{y}.png" },
            });
            expect(data.tilejson).toEqual({ tiles: "https://tiles.example.org/{z}/{x}/{y}.png" });
        });

        it("reads a basemap keyword, which carries no tile metadata", () => {
            const data = manifestWithService({ basemap: "stadia:alidade_smooth" });
            expect(data.map_type).toBe("stadia:alidade_smooth");
            expect(data.tilejson).toBeUndefined();
        });

        it("prefers a basemap keyword when both are present", () => {
            // a keyword names a source the viewer configures itself; the
            // TileJSON would be describing something else
            const data = manifestWithService({
                basemap: "osm",
                tilejson: { tiles: "https://tiles.example.org/{z}/{x}/{y}.png" },
            });
            expect(data.map_type).toBe("osm");
            expect(data.tilejson).toBeUndefined();
        });

        it("ignores a TileJSON with no usable tiles", () => {
            for (const tilejson of [{}, { tiles: [] }, { tiles: 42 }, { minzoom: 3 }]) {
                const data = manifestWithService({ tilejson });
                expect(data.map_type, JSON.stringify(tilejson)).toBeUndefined();
                expect(data.tilejson, JSON.stringify(tilejson)).toBeUndefined();
            }
        });

        it("drops malformed members but keeps the tiles", () => {
            const data = manifestWithService({
                tilejson: {
                    tiles: "https://tiles.example.org/{z}/{x}/{y}.png",
                    minzoom: -1,
                    maxzoom: "17",
                    bounds: [1, 2, 3],
                    scheme: "quadkey",
                    center: [999, 51.9, 12],
                },
            });
            expect(data.tilejson).toEqual({
                tiles: "https://tiles.example.org/{z}/{x}/{y}.png",
            });
        });

        it("ignores a mapType term left over from before §2.9", () => {
            const data = manifestWithService({ mapType: "osm" });
            expect(data.map_type).toBeUndefined();
            expect(data.tilejson).toBeUndefined();
        });
    });

    describe("the map honours it", () => {
        function storymapWith(tilejson?: StorymapTilejson) {
            const el = document.createElement("div");
            el.id = `sm-tilejson-${Math.random().toString(36).slice(2)}`;
            document.body.appendChild(el);
            const storymap: Record<string, unknown> = {
                map_type: "https://tiles.example.org/{z}/{x}/{y}.png",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Somewhere", text: "" },
                        location: { lat: 51.9244, lon: 4.4777 },
                    },
                ],
            };
            if (tilejson) storymap.tilejson = tilejson;
            const sm = new StoryMap(el.id, { storymap } as unknown as StorymapDataWrapper);
            return { sm, el };
        }

        function viewOf(sm: StoryMap) {
            // StoryMap's `_map` is the OpenLayers *engine*; the ol/Map is
            // inside it
            return (
                sm as unknown as {
                    _map: { _map: { getView(): { getMinZoom(): number; getMaxZoom(): number } } };
                }
            )._map._map.getView();
        }

        it("clamps the zoom ladder to the source's own", () => {
            const { sm } = storymapWith({
                tiles: "https://tiles.example.org/{z}/{x}/{y}.png",
                minzoom: 6,
                maxzoom: 14,
            });
            // the default ladder would be 0..19
            expect(viewOf(sm).getMinZoom()).toBe(6);
            expect(viewOf(sm).getMaxZoom()).toBe(14);
        });

        it("keeps the default ladder when the source says nothing", () => {
            const { sm } = storymapWith();
            expect(viewOf(sm).getMinZoom()).toBe(0);
            expect(viewOf(sm).getMaxZoom()).toBe(19);
        });

        it("passes the zoom range to the tile source", () => {
            const { sm } = storymapWith({
                tiles: "https://tiles.example.org/{z}/{x}/{y}.png",
                minzoom: 3,
                maxzoom: 11,
            });
            // OpenLayers turns the range into the source's tile grid, which is
            // what actually stops it asking for levels the service lacks
            const grid = (
                sm.getBaseLayer()?.getSource() as unknown as {
                    getTileGrid(): { getMinZoom(): number; getMaxZoom(): number };
                }
            ).getTileGrid();
            expect(grid.getMinZoom()).toBe(3);
            expect(grid.getMaxZoom()).toBe(11);
        });

        it("flips the tile row for a tms scheme", () => {
            const xyz = storymapWith({
                tiles: "https://tiles.example.org/{z}/{x}/{y}.png",
                maxzoom: 4,
            });
            const xyzTileUrl = (
                xyz.sm.getBaseLayer()?.getSource() as unknown as {
                    getTileUrlFunction(): (c: number[]) => string;
                }
            ).getTileUrlFunction();
            const xyzUrl = xyzTileUrl([4, 1, 0]);
            xyz.el.remove();

            const tms = storymapWith({
                tiles: "https://tiles.example.org/{z}/{x}/{y}.png",
                maxzoom: 4,
                scheme: "tms",
            });
            const tmsTileUrl = (
                tms.sm.getBaseLayer()?.getSource() as unknown as {
                    getTileUrlFunction(): (c: number[]) => string;
                }
            ).getTileUrlFunction();
            const tmsUrl = tmsTileUrl([4, 1, 0]);
            tms.el.remove();

            expect(xyzUrl).toBe("https://tiles.example.org/4/1/0.png");
            // TMS row 0 from the top is row 2**maxzoom - 1 counted from the
            // bottom, so a 4-level pyramid flips it to 15
            expect(tmsUrl).toBe("https://tiles.example.org/4/1/15.png");
        });

        it("leaves an xyz source alone when the metadata describes another", () => {
            // tilejson.tiles naming a different template must not constrain
            // this source's zoom range
            const { sm } = storymapWith({
                tiles: "https://other.example.org/{z}/{x}/{y}.png",
                minzoom: 6,
                maxzoom: 14,
            });
            expect(viewOf(sm).getMinZoom()).toBe(0);
            expect(viewOf(sm).getMaxZoom()).toBe(19);
        });
    });
});
