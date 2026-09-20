import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * The current slide must always be part of the URL as a #slide-N hash,
 * without destroying any query string (the embed player and the test
 * harness carry their configuration in ?url=/?example=).
 *
 * The full load path is covered by e2e (OL's loadend never fires in jsdom);
 * here the hash helpers are driven directly.
 */
describe("slide hash sync", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function makeStoryMap(id: string): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        const data = {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    { date: "", text: { headline: "One", text: "" }, location: { lat: 0, lon: 0 } },
                    { date: "", text: { headline: "Two", text: "" }, location: { lat: 1, lon: 1 } },
                ],
            },
        } as unknown as StorymapDataWrapper;
        return new StoryMap(id, data);
    }

    it("_syncHash rewrites an empty hash and keeps the query string", () => {
        window.history.replaceState(null, "", "/harness.html?example=katrina");
        expect(window.location.hash).toBe("");

        const storymap = makeStoryMap("sm-hash-initial");
        storymap["_syncHash"]();

        expect(window.location.hash).toBe("#slide-0");
        expect(window.location.search).toBe("?example=katrina");
        expect(window.location.pathname + window.location.search + window.location.hash).toBe(
            "/harness.html?example=katrina#slide-0",
        );
    });

    it("the hash tracks every navigation", () => {
        window.history.replaceState(null, "", "/index.html");
        const storymap = makeStoryMap("sm-hash-nav");

        storymap.goTo(2);
        storymap["_syncHash"]();
        expect(window.location.hash).toBe("#slide-2");
        expect(window.location.search).toBe("");

        storymap.goTo(1);
        storymap["_syncHash"]();
        expect(window.location.hash).toBe("#slide-1");
    });

    it("_applyHashSlide applies a #slide-N deep link", () => {
        window.history.replaceState(null, "", "/index.html#slide-2");
        const storymap = makeStoryMap("sm-hash-deep");

        expect(storymap["_applyHashSlide"]()).toBe(true);
        expect(storymap.current_slide).toBe(2);
    });

    it("_applyHashSlide ignores out-of-range and malformed hashes", () => {
        window.history.replaceState(null, "", "/index.html#slide-99");
        const storymap = makeStoryMap("sm-hash-range");
        expect(storymap["_applyHashSlide"]()).toBe(false);
        expect(storymap.current_slide).toBe(0);

        window.history.replaceState(null, "", "/index.html#other");
        expect(storymap["_applyHashSlide"]()).toBe(false);
    });
});
