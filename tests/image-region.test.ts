import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import { manifestToStorymapData } from "../src/storymap/iiif";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Image region stops (slideshow-style): `location.region` is an IIIF
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

    it("rejects malformed ImageApiSelector values on the live path", () => {
        // The previous version of this test fed malformed values to the
        // retired `storymap:imageRegion` term, which is unread — so it passed
        // because nothing read the term, not because validation rejected
        // anything. These drive the live selector the reader actually parses.
        const manifest = {
            "@context": ["http://iiif.io/api/presentation/3/context.json"],
            id: "https://example.org/manifest",
            type: "Manifest",
            items: [
                canvasWithRegion({
                    type: "SpecificResource",
                    source: "https://example.org/manifest/canvas/1",
                    selector: { type: "ImageApiSelector", value: "xywh=1,2,3" },
                }),
                canvasWithRegion({
                    type: "SpecificResource",
                    source: "https://example.org/manifest/canvas/2",
                    selector: { type: "ImageApiSelector", value: "xywh=a,b,c,d" },
                }),
                canvasWithRegion({
                    type: "SpecificResource",
                    source: "https://example.org/manifest/canvas/3",
                    selector: { type: "ImageApiSelector", value: "xywh=0,0,0,10" },
                }),
            ],
        };
        // canvasWithRegion hardcodes the canvas/2 ids; point each canvas at
        // its own item so all three convert
        manifest.items.forEach((item, n) => {
            item.id = `https://example.org/manifest/canvas/${n + 1}`;
        });
        const data = manifestToStorymapData(manifest);
        for (const slide of data.slides) {
            expect(slide.location?.region).toBeUndefined();
        }
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
