import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";

/**
 * KNOWN ISSUE #417 — "force re-fetch of json data after edits"
 *
 * The `nocache` option appends a `_=<timestamp>` cache-busting parameter to
 * source-file fetches so edited storymap JSON is re-fetched instead of served
 * from the HTTP cache.
 */
describe("known issue #417: nocache re-fetch of the source file", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        document.body.innerHTML = "";
    });

    function stubFetch() {
        const urls: string[] = [];
        const data = {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Paris", text: "" },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                ],
            },
        };
        vi.stubGlobal(
            "fetch",
            vi.fn(async (url: string) => {
                urls.push(String(url));
                return { ok: true, json: async () => data };
            }),
        );
        return urls;
    }

    function container(id: string): void {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
    }

    it("appends a cache-busting timestamp when nocache is true", async () => {
        const urls = stubFetch();
        container("sm-417-nocache");
        new StoryMap("sm-417-nocache", "https://example.com/story.json", { nocache: true });
        await vi.waitFor(() => expect(urls).toHaveLength(1));
        expect(urls[0]).toMatch(/^https:\/\/example\.com\/story\.json\?_=\d+$/);
    });

    it("uses & when the source url already has a query string", async () => {
        const urls = stubFetch();
        container("sm-417-query");
        new StoryMap("sm-417-query", "https://example.com/story.json?v=2", { nocache: true });
        await vi.waitFor(() => expect(urls).toHaveLength(1));
        expect(urls[0]).toMatch(/^https:\/\/example\.com\/story\.json\?v=2&_=\d+$/);
    });

    it("fetches the url unchanged by default", async () => {
        const urls = stubFetch();
        container("sm-417-plain");
        new StoryMap("sm-417-plain", "https://example.com/story.json");
        await vi.waitFor(() => expect(urls).toHaveLength(1));
        expect(urls[0]).toBe("https://example.com/story.json");
    });
});
