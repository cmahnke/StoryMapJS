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
        expect(sm.getMarkers().map((m) => m.marker_number)).toEqual([0, 1, 2]);
        sm.dispose();
    });
});

describe("overview marker clicks", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    it("navigates the story when an overview pin is clicked", () => {
        // an overview-typed slide with a location renders a pin (like the
        // last stop of the katrina tour); clicking it must move the story,
        // not just the map — the overview branch of goTo() used to skip
        // the change event
        const el = document.createElement("div");
        el.id = "sm-overview-click";
        document.body.appendChild(el);
        const sm = new StoryMap("sm-overview-click", {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview" } },
                    {
                        date: "",
                        text: { headline: "Paris", text: "" },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                    {
                        date: "",
                        type: "overview",
                        text: { headline: "Coda" },
                        location: { lat: 51.5, lon: -0.12 },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
        expect(sm.current_slide).toBe(0);
        const marker = sm.getMarker(2) as unknown as { _marker: HTMLElement };
        expect(marker._marker).toBeInstanceOf(HTMLElement);
        marker._marker.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(sm.current_slide).toBe(2);
        sm.dispose();
    });
});
