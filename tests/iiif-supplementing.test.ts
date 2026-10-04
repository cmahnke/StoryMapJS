import { readFileSync } from "node:fs";
import type { StorymapOverlayLayer } from "../src/types";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { manifestToStorymapData, readCommentingAnnotations } from "../src/storymap/iiif";
import {
    storymapToManifest,
    type StorymapDocument,
    type StorymapManifestAnnotation,
} from "../src/storymap/to-iiif";

/**
 * V1 of #358: `motivation: "supplementing"` Sound/Video bodies play as
 * slide narration, and array-valued motivations are honored everywhere —
 * an array used to read as "no motivation" and be accepted as the canvas
 * painting, shadowing the real media.
 */

const CONTEXT = "http://iiif.io/api/presentation/3/context.json";

function manifestWith(
    annotations: unknown[],
    canvasExtra: Record<string, unknown> = {},
): {
    [key: string]: unknown;
    items: { [key: string]: unknown; items: { [key: string]: unknown; items: unknown[] }[] }[];
} {
    return {
        "@context": CONTEXT,
        id: "https://example.org/manifest",
        type: "Manifest",
        items: [
            {
                id: "https://example.org/manifest/canvas/1",
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
                ...canvasExtra,
            },
        ],
    };
}

function painting(id: string, motivation: unknown = "painting"): Record<string, unknown> {
    return {
        id: "https://example.org/manifest/painting/1",
        type: "Annotation",
        motivation,
        body: { id, type: "Image", format: "image/jpeg" },
        target: "https://example.org/manifest/canvas/1",
    };
}

function supplementing(
    id: string,
    motivation: unknown = "supplementing",
    type = "Sound",
): Record<string, unknown> {
    return {
        id: "https://example.org/manifest/narration/1",
        type: "Annotation",
        motivation,
        body: { id, type },
        target: "https://example.org/manifest/canvas/1",
    };
}

describe("array-valued motivation", () => {
    /** First annotation with the given motivation, anywhere in the tree. */
    function findAnnotation(node: unknown, motivation: string): Record<string, unknown> | null {
        if (Array.isArray(node)) {
            for (const entry of node) {
                const found = findAnnotation(entry, motivation);
                if (found !== null) return found;
            }
            return null;
        }
        if (typeof node !== "object" || node === null) return null;
        const record = node as Record<string, unknown>;
        if (record.motivation === motivation) return record;
        for (const value of Object.values(record)) {
            const found = findAnnotation(value, motivation);
            if (found !== null) return found;
        }
        return null;
    }

    it("accepts a painting annotation with motivation ['painting']", () => {
        const data = manifestToStorymapData(
            manifestWith([painting("https://example.org/i.jpg", ["painting"])]),
        );
        expect(data.slides).toHaveLength(1);
        expect(data.slides[0].media?.url).toBe("https://example.org/i.jpg");
    });

    it("does not let a commenting annotation shadow the painting", () => {
        const data = manifestToStorymapData(
            manifestWith([
                {
                    id: "https://example.org/manifest/comment/1",
                    type: "Annotation",
                    motivation: ["commenting"],
                    body: { type: "TextualBody", value: "<p>hi</p>", format: "text/html" },
                    target: "https://example.org/manifest/canvas/1",
                },
                painting("https://example.org/i.jpg"),
            ]),
        );
        expect(data.slides[0].media?.url).toBe("https://example.org/i.jpg");
    });

    it("reads commenting stops with an array motivation", () => {
        const stops = readCommentingAnnotations({
            id: "https://example.org/manifest/canvas/1",
            type: "Canvas",
            width: 800,
            height: 600,
            items: [
                {
                    id: "https://example.org/manifest/page/1",
                    type: "AnnotationPage",
                    items: [
                        {
                            id: "https://example.org/manifest/stop/1",
                            type: "Annotation",
                            motivation: ["commenting"],
                            body: { type: "TextualBody", value: "Stop" },
                            target: "https://example.org/manifest/canvas/1#xywh=10,20,30,40",
                        },
                    ],
                },
            ],
        });
        expect(stops).toHaveLength(1);
    });

    it("reads a georeferencing annotation with an array motivation", () => {
        const raw: unknown = JSON.parse(
            readFileSync(
                join(process.cwd(), "public/examples-iiif/georeferenced-layer.json"),
                "utf8",
            ),
        );
        const annotation = findAnnotation(raw, "georeferencing");
        expect(annotation).not.toBeNull();
        const manifest = manifestWith([
            { ...(annotation as Record<string, unknown>), motivation: ["georeferencing"] },
        ]);
        const data = manifestToStorymapData(manifest);
        const overlays = data.overlays as StorymapOverlayLayer[] | undefined;
        expect(overlays).toHaveLength(1);
        expect(overlays?.[0].georeference).toBeDefined();
    });
});

describe("supplementing Sound/Video to narration", () => {
    it("maps the first Sound body to slide.narration", () => {
        const data = manifestToStorymapData(
            manifestWith([
                painting("https://example.org/i.jpg"),
                supplementing("https://example.org/n.mp3"),
            ]),
        );
        expect(data.slides[0].media?.url).toBe("https://example.org/i.jpg");
        expect(data.slides[0].narration).toEqual({ url: "https://example.org/n.mp3" });
    });

    it("accepts a bare supplementing string and a Video body", () => {
        const data = manifestToStorymapData(
            manifestWith([
                painting("https://example.org/i.jpg"),
                supplementing("https://example.org/n.mp4", "supplementing", "Video"),
            ]),
        );
        expect(data.slides[0].narration).toEqual({ url: "https://example.org/n.mp4" });
    });

    it("ignores supplementing bodies that are not Sound or Video", () => {
        const data = manifestToStorymapData(
            manifestWith([
                painting("https://example.org/i.jpg"),
                supplementing("https://example.org/n.html", "supplementing", "Text"),
            ]),
        );
        expect(data.slides[0].narration).toBeUndefined();
    });

    it("does not duplicate a body carrying both motivations", () => {
        const data = manifestToStorymapData(
            manifestWith([
                {
                    id: "https://example.org/manifest/both/1",
                    type: "Annotation",
                    motivation: ["painting", "supplementing"],
                    body: { id: "https://example.org/n.mp3", type: "Sound" },
                    target: "https://example.org/manifest/canvas/1",
                },
            ]),
        );
        expect(data.slides[0].media?.url).toBe("https://example.org/n.mp3");
        expect(data.slides[0].narration).toBeUndefined();
    });
});

describe("narration round trip", () => {
    function storymap(slide: Record<string, unknown>): StorymapDocument {
        return { storymap: { slides: [slide] } };
    }

    it("writes narration as a supplementing annotation and reads it back", () => {
        const doc = storymap({
            text: { headline: "Stop", text: "" },
            media: { url: "https://example.org/i.jpg" },
            narration: { url: "https://example.org/n.mp3" },
        });
        const manifest = storymapToManifest("roundtrip", doc);
        const annotations = manifest.items[0].items[0].items;
        const supplement = annotations.find(
            (a) => (a as StorymapManifestAnnotation).motivation === "supplementing",
        ) as StorymapManifestAnnotation | undefined;
        expect(supplement?.body).toMatchObject({ id: "https://example.org/n.mp3", type: "Sound" });
        const back = manifestToStorymapData(manifest);
        expect(back.slides[0].narration).toEqual({ url: "https://example.org/n.mp3" });
        expect(back.slides[0].media?.url).toBe("https://example.org/i.jpg");
    });

    it("writes no supplementing annotation without narration", () => {
        const manifest = storymapToManifest(
            "plain",
            storymap({ text: { headline: "Stop", text: "" } }),
        );
        const annotations = manifest.items[0].items[0].items;
        expect(
            annotations.some(
                (a) => (a as StorymapManifestAnnotation).motivation === "supplementing",
            ),
        ).toBe(false);
    });
});
