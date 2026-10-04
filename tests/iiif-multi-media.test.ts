import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { manifestToStorymapData } from "../src/storymap/iiif";
import { storymapToManifest, type StorymapManifestAnnotation } from "../src/storymap/to-iiif";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * V2 of #358: extra `painting` annotations on a canvas read as the slide's
 * `media_extra`, and `media_extra` writes back out as extra paintings — so
 * the second visible slot round-trips instead of living only in
 * storymap-JSON. The layout (`media_layout`) has no IIIF term and stays
 * viewer-side.
 */

const CONTEXT = "http://iiif.io/api/presentation/3/context.json";
const CANVAS = "https://example.org/manifest/canvas/1";

function manifestWith(annotations: unknown[]): { [key: string]: unknown } {
    return {
        "@context": CONTEXT,
        id: "https://example.org/manifest",
        type: "Manifest",
        items: [
            {
                id: CANVAS,
                type: "Canvas",
                width: 800,
                height: 600,
                label: { none: ["Stop"] },
                items: [
                    {
                        id: "https://example.org/manifest/page/1",
                        type: "AnnotationPage",
                        items: annotations,
                    },
                ],
            },
        ],
    };
}

function painting(id: string, bodyExtra: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        id: `https://example.org/manifest/painting/${id}`,
        type: "Annotation",
        motivation: "painting",
        body: { id, type: "Image", format: "image/jpeg", ...bodyExtra },
        target: CANVAS,
    };
}

function paintingsOf(manifest: unknown): Record<string, unknown>[] {
    const canvas = (manifest as { items: Record<string, unknown>[] }).items[0];
    const page = (canvas.items as Record<string, unknown>[])[0];
    return (page.items as Record<string, unknown>[]).map((item) => item as Record<string, unknown>);
}

describe("reader: extra paintings become media_extra", () => {
    it("collects a second painting annotation after the first", () => {
        const out = manifestToStorymapData(
            manifestWith([
                painting("https://example.com/first.jpg"),
                painting("https://example.com/second.jpg"),
            ]),
        );
        expect(out.slides).toHaveLength(1);
        expect(out.slides[0].media?.url).toBe("https://example.com/first.jpg");
        expect(out.slides[0].media_extra).toEqual([{ url: "https://example.com/second.jpg" }]);
    });

    it("collects further bodies of one multi-body annotation", () => {
        const out = manifestToStorymapData(
            manifestWith([
                {
                    id: "https://example.org/manifest/painting/1",
                    type: "Annotation",
                    motivation: "painting",
                    body: [
                        { id: "https://example.com/first.jpg", type: "Image" },
                        { id: "https://example.com/second.jpg", type: "Image" },
                    ],
                    target: CANVAS,
                },
            ]),
        );
        expect(out.slides[0].media?.url).toBe("https://example.com/first.jpg");
        expect(out.slides[0].media_extra).toEqual([{ url: "https://example.com/second.jpg" }]);
    });

    it("carries caption, credit and alt onto the extras", () => {
        const annotation = painting("https://example.com/second.jpg");
        annotation.label = { none: ["Second caption"] };
        annotation.requiredStatement = {
            label: { none: ["Credit"] },
            value: { none: ["Second credit"] },
        };
        annotation.accessibilitySummary = { none: ["Second alt"] };
        const out = manifestToStorymapData(
            manifestWith([painting("https://example.com/first.jpg"), annotation]),
        );
        expect(out.slides[0].media_extra).toEqual([
            {
                url: "https://example.com/second.jpg",
                caption: "Second caption",
                credit: "Credit: Second credit",
                alt: "Second alt",
            },
        ]);
    });

    it("a single painting leaves media_extra absent", () => {
        const out = manifestToStorymapData(
            manifestWith([painting("https://example.com/only.jpg")]),
        );
        expect(out.slides[0].media?.url).toBe("https://example.com/only.jpg");
        expect(out.slides[0].media_extra).toBeUndefined();
    });

    it("narration still wins its own slot and never duplicates a painting", () => {
        const out = manifestToStorymapData(
            manifestWith([
                painting("https://example.com/first.jpg"),
                painting("https://example.com/second.jpg"),
                {
                    id: "https://example.org/manifest/narration/1",
                    type: "Annotation",
                    motivation: "supplementing",
                    body: { id: "https://example.com/voice.mp3", type: "Sound" },
                    target: CANVAS,
                },
            ]),
        );
        expect(out.slides[0].narration).toEqual({ url: "https://example.com/voice.mp3" });
        expect(out.slides[0].media_extra).toHaveLength(1);
    });
});

describe("writer: media_extra becomes extra paintings", () => {
    function canvasFor(extra: unknown): Record<string, unknown>[] {
        const manifest = storymapToManifest("extra", {
            storymap: {
                slides: [
                    {
                        text: { headline: "Stop", text: "" },
                        media: { url: "https://example.com/first.jpg" },
                        media_extra: extra as never,
                    },
                ],
            },
        });
        return paintingsOf(manifest);
    }

    it("emits one painting annotation per extra with a url", () => {
        const items = canvasFor([
            { url: "https://example.com/second.jpg", caption: "Two" },
            { url: "", caption: "Skipped" },
        ]);
        expect(items).toHaveLength(2);
        const extra = items[1] as unknown as StorymapManifestAnnotation;
        expect(extra.motivation).toBe("painting");
        expect(extra.id).toBe("https://example.org/storymap/extra/canvas/1/annotation/extra-1");
        expect(extra.body).toMatchObject({ id: "https://example.com/second.jpg" });
        expect(extra.label).toEqual({ none: ["Two"] });
    });

    it("round-trips media and extras back to the same urls", () => {
        const legacy = {
            storymap: {
                slides: [
                    {
                        text: { headline: "Stop", text: "" },
                        media: { url: "https://example.com/first.jpg", caption: "One" },
                        media_extra: [{ url: "https://example.com/second.jpg", caption: "Two" }],
                    },
                ],
            },
        };
        const out = manifestToStorymapData(storymapToManifest("extra", legacy));
        expect(out.slides[0].media?.url).toBe("https://example.com/first.jpg");
        expect(out.slides[0].media?.caption).toBe("One");
        expect(out.slides[0].media_extra?.map((item) => item.url)).toEqual([
            "https://example.com/second.jpg",
        ]);
        expect(out.slides[0].media_extra?.[0].caption).toBe("Two");
    });
});

describe("viewer: the consent scan sees every item", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    afterEach(() => {
        window.localStorage.clear();
        document.body.innerHTML = "";
    });

    it("lists a service per media type across primary and extras", () => {
        window.location.hash = "";
        const el = document.createElement("div");
        el.id = "consent-extra";
        document.body.appendChild(el);
        new StoryMap("consent-extra", {
            storymap: {
                map_type: "none",
                consent_required: true,
                slides: [
                    {
                        date: "",
                        text: { headline: "Stop", text: "" },
                        media: { url: "https://example.com/photo.jpg" },
                        media_extra: [{ url: "https://example.com/tone.mp3" }],
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
        const labels = [...document.querySelectorAll(".vco-consent-service-label")].map(
            (node) => node.textContent,
        );
        expect(labels).toContain("Image");
        expect(labels).toContain("Audio");
    });
});
