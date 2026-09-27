import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Navigation must never mutate the author's storymap document:
 * `StoryMap.data` is the very object the host passed in, and the viewer
 * used to write the computed marker zoom back onto `slides[i].location.zoom`
 * (now kept in an internal store, see Map._marker_zooms).
 */
describe("storymap data is not mutated by the viewer", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function makeStorymap(id: string): { storymap: StoryMap; data: StorymapDataWrapper } {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        const data = {
            storymap: {
                map_type: "osm",
                calculate_zoom: true,
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
        } as unknown as StorymapDataWrapper;
        return { storymap: new StoryMap(id, data), data };
    }

    it("leaves the author's locations untouched when calculating marker zooms", () => {
        const { storymap } = makeStorymap("sm-nomutate-zoom");
        const before = structuredClone(storymap.data);
        // the engine computes the zoom ladder during navigation; call it
        // directly to assert the write-back is gone
        (
            storymap as unknown as { _map: { calculateMarkerZooms(): void } }
        )._map.calculateMarkerZooms();
        expect(storymap.data).toEqual(before);
        // and no zoom was written onto the slides
        for (const slide of storymap.data.slides) {
            if (slide.location) {
                expect(slide.location.zoom).toBeUndefined();
            }
        }
    });

    it("leaves the document untouched across navigation", () => {
        const { storymap } = makeStorymap("sm-nomutate-goto");
        const before = structuredClone(storymap.data);
        storymap.goTo(1);
        storymap.goTo(2);
        storymap.goTo(0);
        expect(storymap.data).toEqual(before);
    });

    it("keeps an authored zoom as authored", () => {
        const el = document.createElement("div");
        el.id = "sm-nomutate-authored";
        document.body.appendChild(el);
        const data = {
            storymap: {
                map_type: "osm",
                calculate_zoom: true,
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Paris", text: "" },
                        location: { lat: 48.85, lon: 2.35, zoom: 12 },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper;
        const sm = new StoryMap("sm-nomutate-authored", data);
        const before = structuredClone(sm.data);
        (sm as unknown as { _map: { calculateMarkerZooms(): void } })._map.calculateMarkerZooms();
        expect(sm.data).toEqual(before);
        // the engine keeps the computed zoom internally, and the min/max
        // bounds are derived from the authored one
        expect(sm.data.slides[1].location?.zoom).toBe(12);
    });
});
