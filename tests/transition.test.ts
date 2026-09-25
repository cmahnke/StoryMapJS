import { beforeAll, describe, expect, it } from "vitest";
import { slideTransitionDuration } from "../src/core/Util";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

describe("slideTransitionDuration", () => {
    it("scales with the jump distance within bounds", () => {
        expect(slideTransitionDuration(0, 1)).toBe(1120);
        expect(slideTransitionDuration(5, 0)).toBe(1600);
        expect(slideTransitionDuration(0, 0)).toBe(1000);
        expect(slideTransitionDuration(0, 100)).toBe(2000);
    });
});

describe("slide navigation events", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymapWithSlides(id: string, options?: Record<string, unknown>): StoryMap {
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
                    {
                        date: "",
                        text: { headline: "Berlin", text: "" },
                        location: { lat: 52.52, lon: 13.4 },
                    },
                ],
            },
        };
        return new StoryMap(id, data as unknown as StorymapDataWrapper, options ?? {});
    }

    it("goTo fires change exactly once", () => {
        const storymap = storymapWithSlides("sm-transition-change");
        const changes: unknown[] = [];
        storymap.on("change", (e: unknown) => changes.push(e));
        storymap.goTo(1);
        expect(storymap.current_slide).toBe(1);
        expect(changes).toHaveLength(1);
        expect(changes[0]).toMatchObject({ current_slide: 1 });
    });

    it("announces transitions with start/end around the glide", async () => {
        const storymap = storymapWithSlides("sm-transition-events");
        const events: Array<{ type: string; slide: number; duration?: number }> = [];
        storymap.on("transitionstart", (e: unknown) => {
            const { current_slide, duration } = e as { current_slide: number; duration: number };
            events.push({ type: "start", slide: current_slide, duration });
        });
        storymap.on("transitionend", (e: unknown) => {
            events.push({ type: "end", slide: (e as { current_slide: number }).current_slide });
        });
        storymap.goTo(2);
        expect(events).toEqual([{ type: "start", slide: 2, duration: 1240 }]);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        expect(events).toEqual([
            { type: "start", slide: 2, duration: 1240 },
            { type: "end", slide: 2 },
        ]);
    }, 10000);

    it("navigates with global arrow keys only when the keyboard option is on", () => {
        const enabled = storymapWithSlides("sm-transition-keys-on", { keyboard: true });
        // synthesized events must bubble for window listeners (as real keys do)
        const arrowRight = () =>
            document.body.dispatchEvent(
                new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
            );
        arrowRight();
        expect(enabled.current_slide).toBe(1);

        const disabled = storymapWithSlides("sm-transition-keys-off");
        arrowRight();
        expect(disabled.current_slide).toBe(0);
    });
});
