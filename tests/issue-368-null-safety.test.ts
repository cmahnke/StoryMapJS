import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import MediaType from "../src/media/MediaType";
import type { StorymapDataWrapper } from "../src/types";

/**
 * KNOWN ISSUE #368 — "null style attribute"
 *
 * Slides with missing or null `media`/`location` fields must not throw when
 * the storymap is created and navigated. (The JSON Schema forbids null, but
 * hand-written storymaps in the wild contain them.)
 */
describe("known issue #368: null/missing slide fields", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    it("creates and navigates a storymap with null media and null location", () => {
        const el = document.createElement("div");
        el.id = "sm-368-null";
        document.body.appendChild(el);
        const data: Record<string, unknown> = {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Null media", text: "media is null" },
                        media: null,
                    },
                    {
                        date: "",
                        text: { headline: "Null location", text: "location is null" },
                        media: { url: "", caption: "", credit: "" },
                        location: null,
                    },
                    {
                        date: "",
                        text: { headline: "Normal", text: "" },
                        media: { url: "", caption: "", credit: "" },
                        location: { lat: 48.85, lon: 2.35, zoom: 6 },
                    },
                ],
            },
        };
        const storymap = new StoryMap("sm-368-null", data as unknown as StorymapDataWrapper);
        expect(() => {
            storymap.goTo(1);
            storymap.goTo(2);
            storymap.goTo(3);
        }).not.toThrow();
        expect(storymap.current_slide).toBe(3);
    });

    it("classifies unknown media urls without throwing", () => {
        expect(() => MediaType({ url: "", caption: "", credit: "" })).not.toThrow();
        expect(() => MediaType({ url: "not a url", caption: "", credit: "" })).not.toThrow();
    });
});
