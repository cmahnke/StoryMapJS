import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import { isPresentation3Manifest, manifestToStorymapData } from "../src/storymap/iiif";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Image region stops (StrollView-style): `location.region` is an IIIF
 * xywh box ([x, y, w, h] image pixels). A IIIF manifest encodes it as the
 * painting annotation's `ImageApiSelector` target selector; invalid regions
 * are ignored.
 */
describe("image region stops", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function canvasWithRegion(selector: unknown) {
        return {
            id: "https://example.org/manifest/canvas/2",
            type: "Canvas",
            label: { none: ["Head"] },
            items: [
                {
                    id: "https://example.org/manifest/canvas/2/page/1",
                    type: "AnnotationPage",
                    items: [
                        {
                            id: "https://example.org/manifest/canvas/2/annotation/1",
                            type: "Annotation",
                            motivation: "painting",
                            body: { id: "https://example.org/i.jpg", type: "Image" },
                            target: selector,
                        },
                    ],
                },
            ],
        };
    }

    it("round-trips the ImageApiSelector on the painting target", () => {
        const manifest = {
            "@context": [
                "http://iiif.io/api/presentation/3/context.json",
                "https://cmahnke.github.io/StoryMapJS/context.json",
            ],
            id: "https://example.org/manifest",
            type: "Manifest",
            items: [
                {
                    id: "https://example.org/manifest/canvas/1",
                    type: "Canvas",
                    label: { none: ["Overview"] },
                    storymap: { type: "overview" },
                },
                canvasWithRegion({
                    type: "SpecificResource",
                    source: "https://example.org/manifest/canvas/2",
                    selector: { type: "ImageApiSelector", value: "xywh=pixel:800,100,700,700" },
                }),
            ],
        };
        expect(isPresentation3Manifest(manifest)).toBe(true);
        const data = manifestToStorymapData(manifest);
        expect(data.slides[0].location).toBeUndefined();
        expect(data.slides[1].location?.region).toEqual([800, 100, 700, 700]);
    });

    it("ignores an imageRegion term left over from before §2.8", () => {
        const manifest = {
            "@context": [
                "http://iiif.io/api/presentation/3/context.json",
                "https://cmahnke.github.io/StoryMapJS/context.json",
            ],
            id: "https://example.org/manifest",
            type: "Manifest",
            items: [
                {
                    id: "https://example.org/manifest/canvas/1",
                    type: "Canvas",
                    label: { none: ["Head"] },
                    "storymap:imageRegion": [800, 100, 700, 700],
                },
            ],
        };
        const data = manifestToStorymapData(manifest);
        expect(data.slides[0].location).toBeUndefined();
    });

    it("ignores invalid regions (wrong length, non-numeric)", () => {
        const manifest = {
            "@context": ["http://iiif.io/api/presentation/3/context.json"],
            id: "https://example.org/manifest",
            type: "Manifest",
            items: [
                {
                    id: "https://example.org/manifest/canvas/1",
                    type: "Canvas",
                    label: { none: ["Bad length"] },
                    "storymap:imageRegion": [1, 2, 3],
                },
                {
                    id: "https://example.org/manifest/canvas/2",
                    type: "Canvas",
                    label: { none: ["Non numeric"] },
                    "storymap:imageRegion": [1, 2, "3", 4],
                },
            ],
        };
        const data = manifestToStorymapData(manifest);
        expect(data.slides[0].location?.region).toBeUndefined();
        expect(data.slides[1].location?.region).toBeUndefined();
    });

    it("keeps the region on slides through StoryMap creation", () => {
        const el = document.createElement("div");
        el.id = "sm-region";
        document.body.appendChild(el);
        const data = {
            storymap: {
                map_type: "iiif",
                map_as_image: true,
                iiif: { url: "https://iiif.example.org/info.json", attribution: "" },
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Region", text: "" },
                        location: { region: [800, 100, 700, 700] },
                    },
                ],
            },
        };
        const storymap = new StoryMap("sm-region", data as unknown as StorymapDataWrapper);
        const slides = (
            storymap as unknown as {
                _storyslider: { _slides: { data: { location?: { region?: number[] } } }[] };
            }
        )._storyslider._slides;
        expect(slides[1].data.location?.region).toEqual([800, 100, 700, 700]);
    });
});
