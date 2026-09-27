import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    clearSeeAlsoCache,
    collectManifestSeeAlso,
    collectSeeAlso,
    loadSeeAlso,
    manifestToStorymapData,
} from "../src/storymap/iiif";

/**
 * `seeAlso` — external annotation pages (interop §5.2). The decision recorded in
 * the plan is that these are read *asynchronously*, behind a cache, and never
 * from `manifestToStorymapData`: a manifest can point at anything, and a viewer
 * that blocks its first paint on a third-party round trip is worse than one
 * that shows the story and adds detail afterwards.
 */
describe("seeAlso", () => {
    beforeEach(() => {
        clearSeeAlsoCache();
        vi.restoreAllMocks();
    });

    const canvas = (id: string) => ({
        id,
        type: "Canvas",
        width: 1080,
        height: 1080,
        items: [
            {
                id: `${id}/page/1`,
                type: "AnnotationPage",
                items: [
                    {
                        id: `${id}/annotation/1`,
                        type: "Annotation",
                        motivation: "painting",
                        body: { id: "https://example.org/i.jpg", type: "Image" },
                        target: id,
                    },
                ],
            },
        ],
    });

    const commenting = (id: string, target: string, text: string) => ({
        id,
        type: "Annotation",
        motivation: "commenting",
        body: { type: "TextualBody", value: text, format: "text/html" },
        target: {
            type: "SpecificResource",
            source: target,
            selector: { type: "ImageApiSelector", value: "xywh=10,10,100,100" },
        },
    });

    function stubFetch(documents: Record<string, unknown>, fail: string[] = []) {
        const calls: string[] = [];
        const impl = (async (url: string) => {
            calls.push(String(url));
            if (fail.includes(String(url))) {
                return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
            }
            const body = documents[String(url)];
            if (body === undefined) {
                return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
            }
            return { ok: true, status: 200, json: async () => body } as unknown as Response;
        }) as unknown as typeof fetch;
        return { impl, calls };
    }

    describe("collecting the references", () => {
        it("reads a manifest-level and a canvas-level target", () => {
            const manifest = {
                type: "Manifest",
                seeAlso: [
                    { id: "https://anno.example.org/collection", type: "AnnotationCollection" },
                ],
                items: [
                    {
                        ...canvas("https://example.org/canvas/1"),
                        seeAlso: { id: "https://anno.example.org/page/1", type: "AnnotationPage" },
                    },
                ],
            };
            expect(collectManifestSeeAlso(manifest)).toEqual([
                { id: "https://anno.example.org/collection", type: "AnnotationCollection" },
                { id: "https://anno.example.org/page/1", type: "AnnotationPage" },
            ]);
        });

        it("de-duplicates a target named twice", () => {
            const shared = { id: "https://anno.example.org/c", type: "AnnotationCollection" };
            const manifest = {
                type: "Manifest",
                seeAlso: [shared],
                items: [
                    canvas("https://example.org/canvas/1"),
                    { ...canvas("c2"), seeAlso: shared },
                ],
            };
            expect(collectManifestSeeAlso(manifest)).toHaveLength(1);
        });

        it("records an untyped target as unknown rather than guessing", () => {
            // fetching a URI on the strength of a guess is how a viewer
            // dereferences something it should not have
            expect(collectSeeAlso({ seeAlso: { id: "https://x.example/y" } })).toEqual([
                { id: "https://x.example/y", type: "unknown" },
            ]);
        });

        it("ignores a seeAlso with no id", () => {
            expect(collectSeeAlso({ seeAlso: { type: "AnnotationCollection" } })).toEqual([]);
            expect(collectSeeAlso({})).toEqual([]);
        });
    });

    describe("loading", () => {
        const manifest = {
            type: "Manifest",
            id: "https://example.org/manifest",
            seeAlso: [{ id: "https://anno.example.org/collection", type: "AnnotationCollection" }],
            items: [canvas("https://example.org/canvas/1")],
        };

        it("turns external annotations into tour stops", async () => {
            const { impl } = stubFetch({
                "https://anno.example.org/collection": {
                    type: "AnnotationCollection",
                    items: [
                        commenting(
                            "https://anno.example.org/a/1",
                            "https://example.org/canvas/1",
                            "A note",
                        ),
                    ],
                },
            });
            const loaded = await loadSeeAlso(manifest, { fetchImpl: impl });
            const stops = loaded.stops.get("https://example.org/canvas/1");
            expect(stops).toHaveLength(1);
            expect(stops?.[0].text?.text).toContain("A note");
            expect(stops?.[0].location?.region).toEqual([10, 10, 100, 100]);
        });

        it("follows a referenced page inside a collection, one level deep", async () => {
            const { impl, calls } = stubFetch({
                "https://anno.example.org/collection": {
                    type: "AnnotationCollection",
                    // no `items` of its own: a reference to a page
                    items: [{ id: "https://anno.example.org/page/1", type: "AnnotationPage" }],
                },
                "https://anno.example.org/page/1": {
                    type: "AnnotationPage",
                    id: "https://anno.example.org/page/1",
                    items: [
                        commenting(
                            "https://anno.example.org/a/2",
                            "https://example.org/canvas/1",
                            "Deep",
                        ),
                    ],
                },
            });
            const loaded = await loadSeeAlso(manifest, { fetchImpl: impl });
            expect(loaded.stops.get("https://example.org/canvas/1")?.[0].text?.text).toContain(
                "Deep",
            );
            expect(calls).toHaveLength(2);
        });

        it("does not follow a seeAlso inside a fetched page", async () => {
            // one level only, or a cycle becomes an infinite walk
            const { impl, calls } = stubFetch({
                "https://anno.example.org/collection": {
                    type: "AnnotationCollection",
                    items: [
                        {
                            id: "https://anno.example.org/page/1",
                            type: "AnnotationPage",
                            items: [
                                commenting(
                                    "https://anno.example.org/a/1",
                                    "https://example.org/canvas/1",
                                    "x",
                                ),
                            ],
                            // a further hop, which must not be followed
                            seeAlso: {
                                id: "https://anno.example.org/page/2",
                                type: "AnnotationPage",
                            },
                        },
                    ],
                },
            });
            await loadSeeAlso(manifest, { fetchImpl: impl });
            expect(calls).not.toContain("https://anno.example.org/page/2");
        });

        it("records a SearchService1 rather than fetching it", async () => {
            const { impl, calls } = stubFetch({});
            const loaded = await loadSeeAlso(
                {
                    type: "Manifest",
                    seeAlso: [{ id: "https://search.example.org/", type: "SearchService1" }],
                    items: [],
                },
                { fetchImpl: impl },
            );
            expect(loaded.searchService).toBe("https://search.example.org/");
            expect(calls).toEqual([]);
        });

        it("warns and carries on when a document cannot be read", async () => {
            const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
            const { impl } = stubFetch({}, ["https://anno.example.org/collection"]);
            const loaded = await loadSeeAlso(manifest, { fetchImpl: impl });
            expect(loaded.failed).toEqual(["https://anno.example.org/collection"]);
            expect(loaded.stops.size).toBe(0);
            expect(warn).toHaveBeenCalled();
        });

        it("ignores annotations aimed at a canvas this manifest does not have", async () => {
            const { impl } = stubFetch({
                "https://anno.example.org/collection": {
                    type: "AnnotationCollection",
                    items: [
                        commenting(
                            "https://anno.example.org/a/1",
                            "https://other.example/canvas/9",
                            "x",
                        ),
                    ],
                },
            });
            const loaded = await loadSeeAlso(manifest, { fetchImpl: impl });
            expect(loaded.stops.size).toBe(0);
        });
    });

    describe("the cache", () => {
        const manifest = {
            type: "Manifest",
            seeAlso: [{ id: "https://anno.example.org/collection", type: "AnnotationCollection" }],
            items: [canvas("https://example.org/canvas/1")],
        };
        const document = {
            type: "AnnotationCollection",
            items: [
                commenting("https://anno.example.org/a/1", "https://example.org/canvas/1", "x"),
            ],
        };

        it("fetches a document once, however many times it is asked for", async () => {
            const { impl, calls } = stubFetch({ "https://anno.example.org/collection": document });
            await loadSeeAlso(manifest, { fetchImpl: impl });
            await loadSeeAlso(manifest, { fetchImpl: impl });
            expect(calls).toEqual(["https://anno.example.org/collection"]);
        });

        it("shares one request between callers racing the same page", async () => {
            const { impl, calls } = stubFetch({ "https://anno.example.org/collection": document });
            await Promise.all([
                loadSeeAlso(manifest, { fetchImpl: impl }),
                loadSeeAlso(manifest, { fetchImpl: impl }),
            ]);
            expect(calls).toHaveLength(1);
        });

        it("does not cache a failure forever", async () => {
            // a cached rejection remembered for the life of the page would make
            // a transient outage permanent
            const first = stubFetch({}, ["https://anno.example.org/collection"]);
            vi.spyOn(console, "warn").mockImplementation(() => undefined);
            await loadSeeAlso(manifest, { fetchImpl: first.impl });
            const second = stubFetch({ "https://anno.example.org/collection": document });
            const loaded = await loadSeeAlso(manifest, { fetchImpl: second.impl });
            expect(second.calls).toEqual(["https://anno.example.org/collection"]);
            expect(loaded.stops.size).toBe(1);
        });

        it("keys on the type as well as the id", async () => {
            // the same URL reached as a collection and as a page is read
            // differently, so the type has to be part of the key
            const { impl, calls } = stubFetch({ "https://anno.example.org/x": document });
            await loadSeeAlso(
                {
                    type: "Manifest",
                    seeAlso: [{ id: "https://anno.example.org/x", type: "AnnotationCollection" }],
                    items: [],
                },
                { fetchImpl: impl },
            );
            await loadSeeAlso(
                {
                    type: "Manifest",
                    seeAlso: [{ id: "https://anno.example.org/x", type: "AnnotationPage" }],
                    items: [],
                },
                { fetchImpl: impl },
            );
            expect(calls).toHaveLength(2);
        });
    });

    it("the data records the targets without fetching them", () => {
        // manifestToStorymapData must not touch the network: it is synchronous
        // and runs before first paint
        const data = manifestToStorymapData({
            type: "Manifest",
            id: "https://example.org/manifest",
            label: { none: ["x"] },
            seeAlso: [{ id: "https://anno.example.org/collection", type: "AnnotationCollection" }],
            items: [],
        });
        expect(data.see_also).toEqual([
            { id: "https://anno.example.org/collection", type: "AnnotationCollection" },
        ]);
    });
});
