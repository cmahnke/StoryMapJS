import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
    isSlideshowCollection,
    slideshowToStorymapData,
    slideshowVersion,
} from "../src/storymap/from-slideshow";
import { validateStorymap } from "../src/storymap/validate";
import type { StorymapData } from "../src/types";

const FIXTURES = join(process.cwd(), "tests/fixtures/slideshow");

function fixture(name: string): unknown {
    return JSON.parse(readFileSync(join(FIXTURES, `${name}.json`), "utf8"));
}

function kinds(result: { warnings: { kind: string }[] }): string[] {
    return result.warnings.map((w) => w.kind);
}

describe("isSlideshowCollection", () => {
    test("detects a v2 tour", () => {
        expect(isSlideshowCollection(fixture("single"))).toBe(true);
    });

    test("detects a v1 tour and reports version 1", () => {
        expect(isSlideshowCollection(fixture("v1"))).toBe(true);
        expect(slideshowVersion(fixture("v1"))).toBe(1);
    });

    test("rejects bare page sequences without the v1 context", () => {
        expect(isSlideshowCollection({ id: "x", type: "AnnotationPageSequence", pages: [] })).toBe(
            false,
        );
    });

    test("rejects IIIF manifests and collections", () => {
        const manifest = {
            "@context": ["http://iiif.io/api/presentation/3/context.json"],
            id: "https://example.org/manifest",
            type: "Manifest",
            items: [],
        };
        expect(isSlideshowCollection(manifest)).toBe(false);
        expect(
            isSlideshowCollection({
                "@context": ["http://iiif.io/api/presentation/3/context.json"],
                id: "https://example.org/collection",
                type: "Collection",
                items: [],
            }),
        ).toBe(false);
    });

    test("rejects annotation pages, storymap wrappers and garbage", () => {
        expect(isSlideshowCollection({ id: "x", type: "AnnotationPage", items: [] })).toBe(false);
        expect(isSlideshowCollection({ storymap: { slides: [] } })).toBe(false);
        expect(isSlideshowCollection(null)).toBe(false);
        expect(isSlideshowCollection("https://example.org/tour")).toBe(false);
        expect(isSlideshowCollection([])).toBe(false);
    });

    test("reports versions", () => {
        expect(slideshowVersion(fixture("single"))).toBe(2);
        expect(
            slideshowVersion({
                "@context": ["https://seige.digital/ns/iiif.jsonld"],
                id: "https://example.org/old",
                type: "AnnotationCollection",
            }),
        ).toBe(1);
        expect(slideshowVersion({})).toBe(0);
    });
});

describe("single-manifest tour", () => {
    test("translates slides, story and credit without warnings", () => {
        const result = slideshowToStorymapData(fixture("single"));
        expect(kinds(result)).toEqual([]);
        expect(validateStorymap({ storymap: result.data })).toEqual([]);
        expect(result.data.slides).toHaveLength(2);
        const first = result.data.slides[0];
        expect(first.uniqueid).toBe("https://example.org/tours/single/annotation/0");
        expect(first.text?.headline).toBe("A single-manifest tour");
        expect(first.text?.text).toBe("<h2>Opening</h2><p>First stop.</p>");
        expect(first.location?.region).toEqual([100, 200, 300, 400]);
        expect(first.location?.rotation).toBe(45);
        expect(first.location?.filter).toEqual({ brightness: 110, sepia: 20 });
        expect(first.location?.mask).toMatchObject({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
        expect(first.narration).toMatchObject({
            url: "https://example.org/audio/0.mp3",
            offset: 2,
        });
        expect(first.location?.basemap).toBe("https://images.example.org/iiif/image/1");
        expect(first.provenance).toMatchObject({
            manifest: "https://images.example.org/iiif/manifest",
            canvas: "https://images.example.org/iiif/canvas/1",
            image: "https://images.example.org/iiif/image/1",
        });
        expect(first.media?.url).toBe("https://images.example.org/static/1.jpg");
        const second = result.data.slides[1];
        expect(second.location?.region).toBeUndefined();
        expect(second.narration).toBeUndefined();
        expect(result.data.map_type).toBe("iiif");
        const data = result.data as unknown as Record<string, unknown>;
        expect(data.title).toBe("A single-manifest tour");
        expect(data.iiif).toMatchObject({
            url: "https://images.example.org/iiif/image/1/info.json",
            attribution: "",
            fallbackUrl: "https://images.example.org/static/1.jpg",
        });
        expect(result.data.credit).toEqual({
            creator: "Example Author",
            rights: "https://creativecommons.org/licenses/by/4.0/",
        });
    });
});

describe("multi-manifest tour", () => {
    test("keeps per-slide basemaps and the static fallback", () => {
        const result = slideshowToStorymapData(fixture("multi"));
        expect(validateStorymap({ storymap: result.data })).toEqual([]);
        expect(result.data.slides).toHaveLength(2);
        expect(result.data.slides[0].location?.basemap).toBe("https://one.example.org/image/1");
        expect(result.data.slides[1].location?.basemap).toBe("https://two.example.org/sheet.jpg");
        expect(result.data.slides[1].media?.url).toBe("https://two.example.org/sheet.jpg");
        const data = result.data as unknown as Record<string, unknown>;
        expect(data.iiif).toMatchObject({
            url: "https://one.example.org/image/1/info.json",
            fallbackUrl: "https://two.example.org/sheet.jpg",
        });
    });
});

describe("overshooting targets", () => {
    test("clamps origins, drops empty regions, warns on malformed fragments", () => {
        const result = slideshowToStorymapData(fixture("negative"));
        expect(validateStorymap({ storymap: result.data })).toEqual([]);
        expect(result.data.slides).toHaveLength(3);
        expect(result.data.slides[0].location?.region).toEqual([0, 1005, 1207, 949]);
        expect(result.data.slides[1].location?.region).toBeUndefined();
        expect(result.data.slides[2].location?.region).toBeUndefined();
        const target = result.warnings.find((w) => w.kind === "slideshow.target");
        expect(target?.count).toBe(2);
    });
});

describe("audio beds", () => {
    test("keeps flags and drops audio duplicating media", () => {
        const result = slideshowToStorymapData(fixture("audio"));
        expect(validateStorymap({ storymap: result.data })).toEqual([]);
        expect(result.data.slides[0].narration).toMatchObject({
            url: "https://example.org/audio/bed.mp3",
            stopOnExit: false,
            stopAllPrevious: false,
        });
        expect(result.data.slides[1].narration).toBeUndefined();
        expect(result.data.slides[1].media?.url).toBe("https://images.example.org/static/dup.jpg");
        expect(kinds(result)).toContain("slideshow.audio-dup");
    });
});

describe("unknown values", () => {
    test("warns and omits, skipping non-annotations", () => {
        const result = slideshowToStorymapData(fixture("unsupported"));
        expect(validateStorymap({ storymap: result.data })).toEqual([]);
        expect(result.data.slides).toHaveLength(1);
        expect(result.data.slides[0].narration?.play).toBe("auto");
        expect(result.data.slides[0].location?.mask).toBeUndefined();
        const found = kinds(result);
        expect(found).toContain("slideshow.audio-play");
        expect(found).toContain("slideshow.passepartout");
        expect(found).toContain("slideshow.annotation");
    });
});

describe("player settings", () => {
    const settings = {
        mode: "static",
        viewerheight: "400px",
        autoplay: true,
        slidetimeout: "6000",
        fxmode: "basic",
        shownav: false,
        showfullscreen: false,
        showinfo: false,
        showscrollbars: false,
        progressbar: "squares",
        textmode: "bottom",
        textsize: "20%",
        imgoverlay: true,
        imgoverlayurl: "https://example.org/badge.png",
        imgoverlaysize: "50%",
        showheadings: false,
        bgcolor: "#000",
        hudbgcolor: "#111111",
        hudcolor: "#ffffff",
        hudopacity: "75",
    };

    test("maps to story options and fans out the overlay", () => {
        const result = slideshowToStorymapData(fixture("single"), { settings });
        expect(validateStorymap({ storymap: result.data })).toEqual([]);
        const data = result.data as unknown as Record<string, unknown>;
        expect(data.mode).toBe("static");
        expect(data.viewerheight).toBe("400px");
        expect(data.autoplay).toBe(6000);
        expect(data.fxmode).toBe("slide");
        expect(data.progressbar).toBe("squares");
        expect(data.textmode).toBe("bottom");
        expect(data.textsize).toBe(20);
        expect(data.shownav).toBe(false);
        expect(data.fullscreen).toBe(false);
        expect(data.show_info).toBe(false);
        expect(data.show_scrollbars).toBe(false);
        expect(data.show_headings).toBe(false);
        expect(data.map_background_color).toBe("#000");
        expect(data.hudbgcolor).toBe("#111111");
        expect(data.hudcolor).toBe("#ffffff");
        expect(data.hudopacity).toBe(75);
        for (const slide of result.data.slides as {
            imgoverlay?: { url: string; size: number };
        }[]) {
            expect(slide.imgoverlay).toEqual({ url: "https://example.org/badge.png", size: 0.5 });
        }
    });

    test("side-dock textsize is omitted (dead in the player)", () => {
        const result = slideshowToStorymapData(fixture("single"), {
            settings: { textmode: "left", textsize: "20%" },
        });
        const data = result.data as unknown as Record<string, unknown>;
        expect(data.textmode).toBe("left");
        expect(data.textsize).toBeUndefined();
        expect(kinds(result)).not.toContain("slideshow.textsize");
    });

    test("autoplay off and unknown enums", () => {
        const off = slideshowToStorymapData(fixture("single"), { settings: {} });
        expect((off.data as unknown as Record<string, unknown>).autoplay).toBe(0);
        const weird = slideshowToStorymapData(fixture("single"), {
            settings: {
                mode: "cinematic",
                fxmode: "spin",
                textmode: "bottom",
                textsize: "tall",
                viewerheight: "tall",
            },
        });
        const found = kinds(weird);
        expect(found).toContain("slideshow.mode");
        expect(found).toContain("slideshow.fxmode");
        expect(found).toContain("slideshow.textsize");
        expect(found).toContain("slideshow.viewerheight");
        expect(validateStorymap({ storymap: weird.data })).toEqual([]);
    });

    test("enabled overlay without a URL warns", () => {
        const result = slideshowToStorymapData(fixture("single"), {
            settings: { imgoverlay: true, imgoverlayurl: "" },
        });
        expect(kinds(result)).toContain("slideshow.imgoverlay");
    });
});

describe("legacy v1 tour", () => {
    test("maps pages to slides with concatenated bodies", () => {
        const result = slideshowToStorymapData(fixture("v1"));
        expect(validateStorymap({ storymap: result.data })).toEqual([]);
        expect(result.data.slides).toHaveLength(2);
        const first = result.data.slides[0];
        expect(first.uniqueid).toBe("https://example.org/tours/legacy/annotation/0");
        expect(first.text?.headline).toBe("A legacy tour");
        expect(first.text?.text).toBe("<p>First part.</p> <p>Second part.</p>");
        // last fragment wins, like the canonical parser
        expect(first.location?.region).toEqual([50, 60, 100, 100]);
        expect(first.location?.basemap).toBe("https://images.example.org/iiif/image/1");
        expect(first.provenance).toMatchObject({
            manifest: "https://images.example.org/iiif/manifest",
            canvas: "https://images.example.org/iiif/canvas/1",
            image: "https://images.example.org/iiif/image/1",
        });
        expect(first.narration).toBeUndefined();
        const second = result.data.slides[1];
        expect(second.location?.region).toBeUndefined();
        expect(result.data.credit).toEqual({
            creator: "Example Author",
            rights: "https://creativecommons.org/licenses/by-sa/4.0/",
        });
        const data = result.data as unknown as Record<string, unknown>;
        expect(data.title).toBe("A legacy tour");
        expect(data.map_type).toBe("iiif");
    });
});

describe("versions and paging", () => {
    test("unknown versions warn without slides", () => {
        const result = slideshowToStorymapData({
            "@context": ["http://example.org/unknown.jsonld"],
            id: "https://example.org/old",
            type: "AnnotationCollection",
        });
        expect(result.data.slides).toEqual([]);
        expect(kinds(result)).toContain("slideshow.version");
    });

    test("non-objects warn without slides", () => {
        const result = slideshowToStorymapData(null);
        expect(result.data.slides).toEqual([]);
        expect(kinds(result)).toContain("slideshow.document");
    });

    test("extra pages append in order", () => {
        const doc = fixture("single") as Record<string, unknown>;
        const first = (doc.first ?? {}) as Record<string, unknown>;
        const page = {
            type: "AnnotationPage",
            items: [
                {
                    id: "https://example.org/tours/single/annotation/2",
                    type: "Annotation",
                    body: { type: "TextualBody", value: "<p>Third.</p>", format: "text/html" },
                    target: { id: "https://images.example.org/iiif/canvas/2", type: "Image" },
                    strollview: {},
                },
            ],
        };
        const result = slideshowToStorymapData(
            { ...doc, first: { ...first } },
            { extraPages: [page] },
        );
        expect(result.data.slides).toHaveLength(3);
        expect(validateStorymap({ storymap: result.data })).toEqual([]);
    });

    test("an unfollowed next link warns", () => {
        const doc = fixture("single") as Record<string, unknown>;
        const first = { ...((doc.first ?? {}) as Record<string, unknown>) };
        first.next = "https://example.org/tours/single/page/2";
        const result = slideshowToStorymapData({ ...doc, first });
        expect(kinds(result)).toContain("slideshow.paging");
        expect(result.data.slides).toHaveLength(2);
    });
});

describe("translator output validity", () => {
    test("every fixture validates", () => {
        for (const name of ["single", "multi", "negative", "audio", "unsupported", "v1"]) {
            const result = slideshowToStorymapData(fixture(name));
            expect(validateStorymap({ storymap: result.data as StorymapData })).toEqual([]);
        }
    });
});
