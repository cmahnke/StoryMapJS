import { describe, expect, it } from "vitest";
import {
    manifestToStorymapData,
    readCommentingAnnotations,
    readSelector,
} from "../src/storymap/iiif";

/**
 * Annotation-driven tour stops: a canvas whose commenting/tagging/classifying/
 * describing annotations carry a fragment target becomes one slide per
 * annotation, each fitting the region it points at. See
 * docs/plans/iiif-media-tours.md §1.
 */

const CANVAS_ID = "https://example.org/storymap/test/canvas/1";

/** A canvas with one painting plus whatever annotations the test adds. */
function manifestWith(annotations: unknown[]): Record<string, unknown> & { items: unknown[] } {
    return {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: "https://example.org/storymap/test",
        type: "Manifest",
        label: { none: ["Test"] },
        items: [
            {
                id: CANVAS_ID,
                type: "Canvas",
                width: 2000,
                height: 1000,
                label: { none: ["Canvas"] },
                items: [
                    {
                        id: `${CANVAS_ID}/annotationpage/1`,
                        type: "AnnotationPage",
                        items: [
                            {
                                id: `${CANVAS_ID}/annotation/1`,
                                type: "Annotation",
                                motivation: "painting",
                                body: {
                                    id: "https://example.org/img/full/max/0/default.jpg",
                                    type: "Image",
                                    format: "image/jpeg",
                                    width: 2000,
                                    height: 1000,
                                },
                                target: CANVAS_ID,
                            },
                        ],
                    },
                    {
                        id: `${CANVAS_ID}/annotationpage/2`,
                        type: "AnnotationPage",
                        items: annotations,
                    },
                ],
            },
        ],
    };
}

function stop(extra: Record<string, unknown>): Record<string, unknown> {
    return {
        id: `${CANVAS_ID}/annotation/99`,
        type: "Annotation",
        target: {
            type: "SpecificResource",
            source: CANVAS_ID,
            selector: { type: "FragmentSelector", value: "xywh=100,200,300,400" },
        },
        ...extra,
    };
}

const TEXT_BODY = { type: "TextualBody", format: "text/plain", value: "Stop text." };

describe("readSelector", () => {
    it("reads an xywh fragment into a region", () => {
        expect(readSelector(`${CANVAS_ID}#xywh=10,20,30,40`).region).toEqual([10, 20, 30, 40]);
    });

    it("reads the Image API Selector and the pixel: variant", () => {
        const target = (value: string) => ({
            type: "SpecificResource",
            source: CANVAS_ID,
            selector: { type: "ImageApiSelector", value },
        });
        expect(readSelector(target("xywh=1,2,3,4")).region).toEqual([1, 2, 3, 4]);
        expect(readSelector(target("xywh=pixel:5,6,7,8")).region).toEqual([5, 6, 7, 8]);
    });

    it("synthesizes a 5% square from a point, clamped to the canvas", () => {
        const sel = readSelector(
            { selector: { type: "PointSelector", x: 1000, y: 500 } },
            2000,
            1000,
        );
        // 5% of min(2000, 1000) = 50, centred on the point
        expect(sel.point).toEqual({ x: 1000, y: 500 });
        expect(sel.region).toEqual([975, 475, 50, 50]);
    });

    it("clamps a synthesized square to the canvas edge", () => {
        const sel = readSelector({ selector: { type: "PointSelector", x: 0, y: 0 } }, 2000, 1000);
        expect(sel.region).toEqual([0, 0, 50, 50]);
    });

    it("has no region from a point when the canvas size is unknown", () => {
        const sel = readSelector({ selector: { type: "PointSelector", x: 10, y: 10 } });
        expect(sel.point).toEqual({ x: 10, y: 10 });
        expect(sel.region).toBeNull();
    });

    it("preserves a TextQuoteSelector without resolving it", () => {
        const sel = readSelector({
            selector: {
                type: "TextQuoteSelector",
                exact: "the quick brown fox",
                prefix: "look: ",
            },
        });
        expect(sel.quote).toEqual({ exact: "the quick brown fox", prefix: "look: " });
        expect(sel.region).toBeNull();
    });

    it("preserves a TimeState and a start/end range", () => {
        expect(readSelector({ state: { type: "TimeState", start: 3, end: 9 } }).time).toEqual({
            start: 3,
            end: 9,
        });
        expect(readSelector({ type: "SpecificResource", start: 1, end: 2 }).time).toEqual({
            start: 1,
            end: 2,
        });
    });

    it("preserves an SvgSelector for round-tripping", () => {
        const sel = readSelector({
            selector: { type: "SvgSelector", value: "<svg><polygon/></svg>" },
        });
        expect(sel.svg).toBe("<svg><polygon/></svg>");
    });

    it("follows one level of refinedBy", () => {
        const sel = readSelector({
            selector: {
                type: "FragmentSelector",
                value: "xywh=1,2,3,4",
                refinedBy: { type: "TextQuoteSelector", exact: "quoted" },
            },
        });
        expect(sel.region).toEqual([1, 2, 3, 4]);
        expect(sel.quote).toEqual({ exact: "quoted" });
    });

    it("rejects a non-positive or malformed region", () => {
        expect(readSelector(`${CANVAS_ID}#xywh=0,0,0,10`).region).toBeNull();
        expect(readSelector(`${CANVAS_ID}#xywh=0,0,10`).region).toBeNull();
        expect(readSelector(`${CANVAS_ID}#xywh=-1,0,10,10`).region).toBeNull();
    });

    it("returns an empty result for an unknown selector", () => {
        const sel = readSelector({ selector: { type: "SomethingElse" } });
        expect(sel).toEqual({ region: null, point: null, quote: null, time: null, svg: null });
    });
});

describe("readCommentingAnnotations", () => {
    it("turns a commenting annotation with a region into a stop", () => {
        const stops = readCommentingAnnotations(
            manifestWith([stop({ motivation: "commenting", body: TEXT_BODY })]).items[0],
        );
        expect(stops).toHaveLength(1);
        expect(stops[0].location?.region).toEqual([100, 200, 300, 400]);
        expect(stops[0].text?.text).toBe("<p>Stop text.</p>");
    });

    it("accepts every stop motivation and ignores the rest", () => {
        for (const motivation of ["commenting", "tagging", "classifying", "describing"]) {
            const stops = readCommentingAnnotations({
                width: 2000,
                height: 1000,
                items: [
                    {
                        items: [
                            stop({
                                motivation,
                                body: TEXT_BODY,
                            }),
                        ],
                    },
                ],
            });
            expect(stops, motivation).toHaveLength(1);
        }
        // a `painting` annotation is the canvas image, not a stop
        expect(
            readCommentingAnnotations({
                items: [{ items: [stop({ motivation: "painting", body: TEXT_BODY })] }],
            }),
        ).toHaveLength(0);
    });

    it("accepts a motivation array", () => {
        const stops = readCommentingAnnotations({
            items: [{ items: [stop({ motivation: ["commenting", "tagging"], body: TEXT_BODY })] }],
        });
        expect(stops).toHaveLength(1);
    });

    it("turns a text/plain body into one paragraph per block, escaped", () => {
        const stops = readCommentingAnnotations({
            items: [
                {
                    items: [
                        stop({
                            motivation: "commenting",
                            body: {
                                type: "TextualBody",
                                format: "text/plain",
                                value: "One <b> & two.\n\nThree.",
                            },
                        }),
                    ],
                },
            ],
        });
        expect(stops[0].text?.text).toBe("<p>One &lt;b&gt; &amp; two.</p><p>Three.</p>");
    });

    it("passes a text/html body through as markup", () => {
        const stops = readCommentingAnnotations({
            items: [
                {
                    items: [
                        stop({
                            motivation: "commenting",
                            body: {
                                type: "TextualBody",
                                format: "text/html",
                                value: "<p>Kept <em>as is</em></p>",
                            },
                        }),
                    ],
                },
            ],
        });
        expect(stops[0].text?.text).toBe("<p>Kept <em>as is</em></p>");
    });

    it("turns a Sound body into slide media", () => {
        const stops = readCommentingAnnotations({
            items: [
                {
                    items: [
                        stop({
                            motivation: "commenting",
                            body: {
                                id: "https://example.org/audio/a.mp3",
                                type: "Sound",
                                format: "audio/mpeg",
                                label: { none: ["Reading"] },
                                accessibilitySummary: { none: ["A voice reading aloud"] },
                                requiredStatement: [{ value: { none: ["A speaker"] } }],
                            },
                        }),
                    ],
                },
            ],
        });
        expect(stops[0].media).toEqual({
            url: "https://example.org/audio/a.mp3",
            caption: "Reading",
            alt: "A voice reading aloud",
            credit: "A speaker",
        });
    });

    it("reads a body thumbnail", () => {
        const stops = readCommentingAnnotations({
            items: [
                {
                    items: [
                        stop({
                            motivation: "commenting",
                            body: {
                                id: "https://example.org/img.jpg",
                                type: "Image",
                                thumbnail: { id: "https://example.org/thumb.jpg", type: "Image" },
                            },
                        }),
                    ],
                },
            ],
        });
        expect(stops[0].media?.thumb).toBe("https://example.org/thumb.jpg");
    });

    it("leaves the headline unset when the annotation has no label", () => {
        // guards the Text placeholder bug: a stop with body text and no
        // headline must not render a literal "headline"
        const stops = readCommentingAnnotations({
            items: [{ items: [stop({ motivation: "commenting", body: TEXT_BODY })] }],
        });
        expect(stops[0].text).toEqual({ text: "<p>Stop text.</p>" });
        expect((stops[0].text as { headline?: string }).headline).toBeUndefined();
    });

    it("uses the annotation label as the stop headline", () => {
        const stops = readCommentingAnnotations({
            items: [
                {
                    items: [
                        stop({
                            motivation: "commenting",
                            label: { none: ["The lower group"] },
                            body: TEXT_BODY,
                        }),
                    ],
                },
            ],
        });
        expect(stops[0].text?.headline).toBe("The lower group");
    });

    it("ignores an annotation that targets the whole canvas", () => {
        // no selector: the canvas slide already shows the whole image
        const stops = readCommentingAnnotations({
            items: [
                {
                    items: [
                        {
                            id: "x",
                            type: "Annotation",
                            motivation: "commenting",
                            body: TEXT_BODY,
                            target: CANVAS_ID,
                        },
                    ],
                },
            ],
        });
        expect(stops).toHaveLength(0);
    });

    it("ignores an annotation with a target but no body", () => {
        const stops = readCommentingAnnotations({
            items: [
                {
                    items: [
                        stop({
                            motivation: "commenting",
                        }),
                    ],
                },
            ],
        });
        expect(stops).toHaveLength(0);
    });

    it("keeps page and annotation order", () => {
        const stops = readCommentingAnnotations({
            items: [
                { items: [stop({ motivation: "commenting", body: TEXT_BODY })] },
                {
                    items: [
                        stop({
                            motivation: "commenting",
                            body: { ...TEXT_BODY, value: "second" },
                        }),
                    ],
                },
            ],
        });
        expect(stops.map((s) => s.text?.text)).toEqual(["<p>Stop text.</p>", "<p>second</p>"]);
    });
});

describe("manifestToStorymapData with annotation stops", () => {
    it("emits the canvas slide then its stops, in order", () => {
        const data = manifestToStorymapData(
            manifestWith([
                stop({ motivation: "commenting", body: TEXT_BODY }),
                stop({
                    motivation: "tagging",
                    body: { ...TEXT_BODY, value: "Second stop." },
                }),
            ]),
        );
        expect(data.slides).toHaveLength(3);
        expect(data.slides[0].text?.headline).toBe("Canvas");
        expect(data.slides[1].location?.region).toEqual([100, 200, 300, 400]);
        expect(data.slides[2].text?.text).toBe("<p>Second stop.</p>");
    });

    it("leaves a canvas without annotations as one slide", () => {
        const data = manifestToStorymapData(manifestWith([]));
        expect(data.slides).toHaveLength(1);
    });

    it("keeps the manifest navPlace fallback aligned to canvases, not stops", () => {
        // two canvases, the first with two stops: the second canvas's slide must
        // still pick up the second manifest-level navPlace feature
        const manifest = {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            id: "https://example.org/storymap/test",
            type: "Manifest",
            navPlace: {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {},
                        geometry: { type: "Point", coordinates: [1, 2] },
                    },
                    {
                        type: "Feature",
                        properties: {},
                        geometry: { type: "Point", coordinates: [30, 40] },
                    },
                ],
            },
            items: [
                {
                    id: `${CANVAS_ID}a`,
                    type: "Canvas",
                    width: 2000,
                    height: 1000,
                    items: [
                        {
                            items: [
                                stop({ motivation: "commenting", body: TEXT_BODY }),
                                stop({
                                    motivation: "commenting",
                                    body: { ...TEXT_BODY, value: "again" },
                                }),
                            ],
                        },
                    ],
                },
                {
                    id: `${CANVAS_ID}b`,
                    type: "Canvas",
                    width: 2000,
                    height: 1000,
                    items: [{ items: [] }],
                },
            ],
        };
        const data = manifestToStorymapData(manifest);
        // canvas a + 2 stops + canvas b
        expect(data.slides).toHaveLength(4);
        // canvas a's slide carries feature[0] = [1, 2] (lon, lat)
        expect(data.slides[0].location).toEqual({ lat: 2, lon: 1 });
        // canvas b's slide carries feature[1] = [30, 40] — not feature[0],
        // which is the bug this guards: the stop slides shift the slide array
        // but must not shift the canvas → manifest-feature alignment
        expect(data.slides[3].location).toEqual({ lat: 40, lon: 30 });
    });

    it("reads the standard body fields as a fallback under the extension terms", () => {
        const manifest = manifestWith([]);
        const canvas = (manifest as { items: Record<string, unknown>[] }).items[0] as Record<
            string,
            unknown
        >;
        const pages = canvas.items as Record<string, unknown>[];
        const painting = (pages[0].items as Record<string, unknown>[])[0];
        painting.body = {
            ...(painting.body as Record<string, unknown>),
            label: { none: ["A caption"] },
            accessibilitySummary: { none: ["Alt text"] },
            requiredStatement: [{ value: { none: ["A credit"] } }],
        };
        const data = manifestToStorymapData(manifest);
        expect(data.slides[0].media?.caption).toBe("A caption");
        expect(data.slides[0].media?.alt).toBe("Alt text");
        expect(data.slides[0].media?.credit).toBe("A credit");
    });

    it("reads a slide's date from the canvas's navDate", () => {
        const manifest = manifestWith([]);
        const canvas = (manifest as { items: Record<string, unknown>[] }).items[0] as Record<
            string,
            unknown
        >;
        // P3 constrains navDate to a plain string and applies no format rule
        // at all, so even a human date survives verbatim
        canvas.navDate = "Aug 23";
        const data = manifestToStorymapData(manifest);
        expect(data.slides[0].date).toBe("Aug 23");
    });

    it("reads a navDate language map, which the validator would reject", () => {
        // We write a bare string, but other producers do emit a language map,
        // and a manifest that is invalid for the official validator should
        // still load rather than lose its date
        const manifest = manifestWith([]);
        const canvas = (manifest as { items: Record<string, unknown>[] }).items[0] as Record<
            string,
            unknown
        >;
        canvas.navDate = { none: ["2005-08-23"], en: ["23 August 2005"] };
        const data = manifestToStorymapData(manifest);
        expect(data.slides[0].date).toBe("2005-08-23");
    });

    it("ignores a storymap:date term left over from before §2.5", () => {
        const manifest = manifestWith([]);
        const canvas = (manifest as { items: Record<string, unknown>[] }).items[0] as Record<
            string,
            unknown
        >;
        canvas["storymap:date"] = "Term date";
        canvas.navDate = "Sep 1";
        const data = manifestToStorymapData(manifest);
        expect(data.slides[0].date).toBe("Sep 1");
    });

    it("ignores a mediaCaption term left over from before §2.7", () => {
        const manifest = manifestWith([]);
        const canvas = (manifest as { items: Record<string, unknown>[] }).items[0] as Record<
            string,
            unknown
        >;
        // a manifest written before the term was dropped still carries it
        canvas["storymap:mediaCaption"] = "Term caption";
        const pages = canvas.items as Record<string, unknown>[];
        const painting = (pages[0].items as Record<string, unknown>[])[0];
        painting.body = {
            ...(painting.body as Record<string, unknown>),
            label: { none: ["Body caption"] },
        };
        const data = manifestToStorymapData(manifest);
        // The term is no longer read at all — not even as a fallback — so the
        // standard property is the only source. A manifest that relied on the
        // term keeps loading, it just loses that string.
        expect(data.slides[0].media?.caption).toBe("Body caption");
    });

    it("prefers the annotation's own label over the body's", () => {
        // P3 puts label on the Annotation; the body is a fallback for
        // producers that put it there
        const manifest = manifestWith([]);
        const canvas = (manifest as { items: Record<string, unknown>[] }).items[0] as Record<
            string,
            unknown
        >;
        const pages = canvas.items as Record<string, unknown>[];
        const painting = (pages[0].items as Record<string, unknown>[])[0];
        painting.label = { none: ["Annotation caption"] };
        painting.body = {
            ...(painting.body as Record<string, unknown>),
            label: { none: ["Body caption"] },
        };
        const data = manifestToStorymapData(manifest);
        expect(data.slides[0].media?.caption).toBe("Annotation caption");
    });
});
