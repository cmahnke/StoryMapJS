import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * `marker_number` is assigned as the marker's index into the map's marker
 * array, and that is exactly what a click hands back to `goTo()`. Removing a
 * marker therefore has to renumber the ones behind it, or a click on the
 * third pin navigates to a slide that has since shifted.
 */
describe("map marker numbering", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymap(id: string, slideCount: number): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);

        const slides: unknown[] = [{ date: "", type: "overview", text: { headline: "Overview" } }];
        for (let i = 0; i < slideCount; i++) {
            slides.push({
                date: "",
                text: { headline: `Slide ${i}` },
                location: { lat: 48.85 + i, lon: 2.35 + i },
            });
        }

        return new StoryMap(id, {
            storymap: { map_type: "osm", calculate_zoom: true, slides },
        } as unknown as StorymapDataWrapper);
    }

    it("renumbers the markers after one is removed", () => {
        const sm = storymap("sm-marker-reindex", 4);
        const before = sm.getMarkers();
        expect(before.length).toBe(5);
        expect(before.map((m) => m.marker_number)).toEqual([0, 1, 2, 3, 4]);

        const engine = (sm as unknown as { _map: { _destroyMarker(m: unknown): void } })._map;
        engine._destroyMarker(before[1]);

        const after = sm.getMarkers();
        expect(after.length).toBe(4);
        // contiguous 0..n-1, matching the array index goTo() expects
        expect(after.map((m) => m.marker_number)).toEqual([0, 1, 2, 3]);
        after.forEach((marker, index) => {
            expect(marker.marker_number).toBe(index);
        });

        sm.dispose();
    });

    it("numbers a newly added marker after the current length", () => {
        const sm = storymap("sm-marker-append", 2);
        const engine = (sm as unknown as { _map: { _markers: { marker_number: number }[] } })._map;
        expect(engine._markers.map((m: { marker_number: number }) => m.marker_number)).toEqual([
            0, 1, 2,
        ]);
        sm.dispose();
    });
});
