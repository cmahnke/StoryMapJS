import { beforeAll, describe, expect, it, vi } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Image loading strategy (perf, backwards-compatible):
 *
 * - slide images render byte-identical `src` URLs — no storymap JSON
 *   changes, no URL rewriting;
 * - the active slide's image is `eager` (first paint + navigation never
 *   wait on a deferred fetch);
 * - preloaded (offscreen) slides stay `lazy` with `decoding="async"`.
 */
describe("slide image loading strategy", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    type SlideProbe = {
        _media?: {
            _el: { content_item?: HTMLImageElement };
            _state?: { loaded?: boolean; eager?: boolean };
        };
        active?: boolean;
    };

    function slidesOf(storymap: StoryMap): SlideProbe[] {
        return (storymap as unknown as { _storyslider: { _slides: SlideProbe[] } })._storyslider
            ._slides;
    }

    function imageOf(slide: SlideProbe): HTMLImageElement | null {
        // content_item is a plain {} stub until the media actually loads
        const item = slide._media?._el.content_item;
        return item instanceof HTMLImageElement ? item : null;
    }

    function storymapWithImages(id: string): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        const data = {
            storymap: {
                map_type: "osm",
                slides: [
                    {
                        date: "",
                        type: "overview",
                        text: { headline: "Overview", text: "" },
                        media: {
                            url: "https://example.com/overview.jpg",
                            caption: "",
                            credit: "",
                        },
                    },
                    {
                        date: "",
                        text: { headline: "Paris", text: "" },
                        media: { url: "https://example.com/paris.jpg", caption: "", credit: "" },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                ],
            },
        };
        return new StoryMap(id, data as unknown as StorymapDataWrapper);
    }

    it("renders identical src URLs with eager loading on the active slide", async () => {
        const storymap = storymapWithImages("sm-img-eager");
        await vi.waitFor(
            () => {
                const img = imageOf(slidesOf(storymap)[0]);
                expect(img?.getAttribute("src")).toBe("https://example.com/overview.jpg");
            },
            { timeout: 15_000 },
        );
        const img = imageOf(slidesOf(storymap)[0]) as HTMLImageElement;
        expect(img.getAttribute("src")).toBe("https://example.com/overview.jpg");
        expect(img.loading).toBe("eager");
        expect(img.decoding).toBe("async");
    }, 25_000);

    it("keeps preloaded slides lazy without rewriting their URLs", async () => {
        const storymap = storymapWithImages("sm-img-lazy");
        // the neighbor preload runs ~1s after the transition settles
        await vi.waitFor(
            () => {
                expect(imageOf(slidesOf(storymap)[1])).not.toBeNull();
            },
            { timeout: 15_000 },
        );
        const img = imageOf(slidesOf(storymap)[1]) as HTMLImageElement;
        expect(img.getAttribute("src")).toBe("https://example.com/paris.jpg");
        expect(img.loading).toBe("lazy");
        expect(img.decoding).toBe("async");
    }, 25_000);
});
