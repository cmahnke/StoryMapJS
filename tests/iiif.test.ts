import { describe, test, expect, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
    isPresentation3Manifest,
    isPresentation3Collection,
    manifestToStorymapData,
} from "../src/storymap/iiif";
import { fitGeoreference } from "../src/map/georeference";
import type { StorymapData, StorymapOverlayLayer } from "../src/types";

const CONTEXTS = [
    "http://iiif.io/api/presentation/3/context.json",
    "http://iiif.io/api/extension/navplace/context.json",
    "https://cmahnke.github.io/StoryMapJS/context.json",
];

const manifest = {
    "@context": CONTEXTS,
    id: "https://example.org/storymap/storm",
    type: "Manifest",
    label: { none: ["storm"] },
    service: [
        {
            id: "https://example.org/storymap/storm/map-config",
            type: "Service",
            profile: "https://christianmahnke.de/iiif/storymap/mapconfig",
            "storymap:basemap": "osm:standard",
            "storymap:language": "en",
            "storymap:showLines": true,
            "storymap:lineColor": "#c0392b",
            "storymap:lineWeight": 3,
            "storymap:lineOpacity": 0.8,
        },
    ],
    items: [
        {
            id: "https://example.org/storymap/storm/canvas/1",
            type: "Canvas",
            label: { none: ["The Path of the Storm"] },
            summary: { none: ["A storm formed over the warm ocean."] },
            items: [
                {
                    id: "https://example.org/storymap/storm/canvas/1/annotationpage/1",
                    type: "AnnotationPage",
                    items: [
                        {
                            id: "https://example.org/storymap/storm/canvas/1/annotation/1",
                            type: "Annotation",
                            motivation: "painting",
                            body: {
                                type: "TextualBody",
                                format: "text/html",
                                value: "<p>A storm formed.</p>",
                            },
                            target: "https://example.org/storymap/storm/canvas/1",
                        },
                    ],
                },
            ],
            "storymap:type": "overview",
            navDate: "Sep 1",
            background: {
                id: "https://example.org/storymap/storm/canvas/1/background",
                type: "Annotation",
                motivation: "painting",
                body: { id: "https://example.org/bg.jpg", type: "Image", format: "image/jpeg" },
                target: "https://example.org/storymap/storm/canvas/1",
            },
        },
        {
            id: "https://example.org/storymap/storm/canvas/2",
            type: "Canvas",
            label: { none: ["Sep 2"] },
            summary: { en: ["The storm made landfall."] },
            items: [
                {
                    id: "https://example.org/storymap/storm/canvas/2/annotationpage/1",
                    type: "AnnotationPage",
                    items: [
                        {
                            id: "https://example.org/storymap/storm/canvas/2/annotation/1",
                            type: "Annotation",
                            motivation: "painting",
                            label: { none: ["Landfall"] },
                            requiredStatement: {
                                label: { none: ["Credit"] },
                                value: { none: ["Weather Service"] },
                            },
                            body: {
                                id: "https://example.org/images/landfall.jpg",
                                type: "Image",
                                format: "image/jpeg",
                            },
                            target: "https://example.org/storymap/storm/canvas/2",
                        },
                    ],
                },
            ],
            background: {
                id: "https://example.org/storymap/storm/canvas/2/background",
                type: "Annotation",
                motivation: "painting",
                body: { id: "https://example.org/bg.jpg", type: "Image", format: "image/jpeg" },
                target: "https://example.org/storymap/storm/canvas/2",
            },
            navPlace: {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [-89.6, 28.2] },
                        properties: { name: "Gulf", zoom: 10, line: true },
                    },
                ],
            },
        },
    ],
};

test("isPresentation3Manifest accepts presentation 3 manifests", () => {
    expect(isPresentation3Manifest(manifest)).toBe(true);
    // type alone is sufficient
    expect(isPresentation3Manifest({ type: "Manifest" })).toBe(true);
    // context alone is sufficient
    expect(
        isPresentation3Manifest({ "@context": "http://iiif.io/api/presentation/3/context.json" }),
    ).toBe(true);
});

test("isPresentation3Manifest rejects non-manifest data", () => {
    expect(isPresentation3Manifest(null)).toBe(false);
    expect(isPresentation3Manifest(undefined)).toBe(false);
    expect(isPresentation3Manifest("https://example.org/manifest.json")).toBe(false);
    expect(isPresentation3Manifest(42)).toBe(false);
    expect(isPresentation3Manifest([])).toBe(false);
    expect(isPresentation3Manifest({ storymap: { slides: [] } })).toBe(false);
    expect(
        isPresentation3Manifest({ "@context": "http://iiif.io/api/presentation/2/context.json" }),
    ).toBe(false);
    expect(isPresentation3Manifest({ type: "Canvas" })).toBe(false);
});

test("converts a small manifest to storymap data", () => {
    const data = manifestToStorymapData(manifest);

    expect(data.title).toBe("storm");
    expect(data.map_type).toBe("osm:standard");
    expect(data.language).toBe("en");
    expect(data.show_lines).toBe(true);
    expect(data.line_color).toBe("#c0392b");
    expect(data.line_weight).toBe(3);
    expect(data.line_opacity).toBe(0.8);

    expect(data.slides).toHaveLength(2);

    const [overview, landfall] = data.slides;

    expect(overview.text?.headline).toBe("The Path of the Storm");
    expect(overview.text?.text).toBe("A storm formed over the warm ocean.");
    expect(overview.type).toBe("overview");
    expect(overview.date).toBe("Sep 1");
    expect(overview.media?.url).toBe("<p>A storm formed.</p>");

    expect(landfall.text?.headline).toBe("Sep 2");
    expect(landfall.text?.text).toBe("The storm made landfall.");
    expect(landfall.media?.url).toBe("https://example.org/images/landfall.jpg");
    expect(landfall.media?.caption).toBe("Landfall");
    expect(landfall.media?.credit).toBe("Credit: Weather Service");
    expect(landfall.background).toEqual({ url: "https://example.org/bg.jpg" });
    expect(landfall.location?.lat).toBe(28.2);
    expect(landfall.location?.lon).toBe(-89.6);
    expect(landfall.location?.zoom).toBe(10);
    expect(landfall.location?.line).toBe(true);
    expect(landfall.location?.name).toBe("Gulf");
});

test("prefers the none language in language maps", () => {
    expect(
        manifestToStorymapData({
            "@context": CONTEXTS,
            label: { en: ["Hello"], none: ["storm"] },
            items: [],
        }).title,
    ).toBe("storm");
});

test("accepts a TextualBody summary", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            {
                type: "Canvas",
                summary: { type: "TextualBody", format: "text/html", value: "Body text" },
            },
        ],
    });
    expect(data.slides[0].text?.text).toBe("Body text");
});

test("returns empty data for malformed manifests", () => {
    const empty: StorymapData = { slides: [] };
    expect(manifestToStorymapData(null)).toEqual(empty);
    expect(manifestToStorymapData(undefined)).toEqual(empty);
    expect(manifestToStorymapData("nope")).toEqual(empty);
    expect(manifestToStorymapData(42)).toEqual(empty);
    expect(manifestToStorymapData([])).toEqual(empty);
    expect(manifestToStorymapData({})).toEqual(empty);
    expect(manifestToStorymapData({ items: "not-an-array" })).toEqual(empty);
});

test("skips malformed pieces without throwing", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            null,
            "garbage",
            {
                // canvas without label/summary/media/navPlace
                type: "Canvas",
            },
            {
                type: "Canvas",
                label: { none: ["Bad location"] },
                navPlace: {
                    type: "FeatureCollection",
                    features: [{ geometry: { type: "Polygon", coordinates: [] } }],
                },
            },
            {
                type: "Canvas",
                label: { none: ["No media body"] },
                items: [{ type: "AnnotationPage", items: [null] }],
            },
        ],
    });

    // the two garbage entries are skipped, the three canvases survive
    expect(data.slides).toHaveLength(3);
    expect(data.slides[0].text).toBeUndefined();
    expect(data.slides[1].location).toBeUndefined();
    expect(data.slides[1].text?.headline).toBe("Bad location");
    expect(data.slides[2].text?.headline).toBe("No media body");
    expect(data.slides[2].media).toBeUndefined();
});

test("falls back to a manifest-level navPlace aggregation", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        navPlace: {
            type: "FeatureCollection",
            features: [
                null,
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [2.35, 48.85] },
                    properties: { zoom: 6 },
                },
            ],
        },
        items: [{ type: "Canvas" }, { type: "Canvas" }],
    });
    expect(data.slides[0].location).toBeUndefined();
    expect(data.slides[1].location?.lat).toBe(48.85);
    expect(data.slides[1].location?.lon).toBe(2.35);
    expect(data.slides[1].location?.zoom).toBe(6);
});

test("reads an image basemap's url from the body's Image API service", () => {
    // §2.4: an image basemap is a painting body carrying an ImageService3
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [{ type: "Service", profile: "mapconfig", basemap: "iiif", mapAsImage: true }],
        items: [
            {
                id: "https://example.org/canvas/1",
                type: "Canvas",
                height: 3000,
                width: 2315,
                items: [
                    {
                        id: "https://example.org/canvas/1/page/1",
                        type: "AnnotationPage",
                        items: [
                            {
                                id: "https://example.org/canvas/1/annotation/1",
                                type: "Annotation",
                                motivation: "painting",
                                body: {
                                    id: "https://iiif.example.org/image/full/max/0/default.jpg",
                                    type: "Image",
                                    format: "image/jpeg",
                                    service: [
                                        {
                                            id: "https://iiif.example.org/image",
                                            type: "ImageService3",
                                            profile: "level2",
                                        },
                                    ],
                                },
                                target: "https://example.org/canvas/1",
                            },
                        ],
                    },
                ],
            },
        ],
    });
    expect(data.map_type).toBe("iiif");
    expect(data.iiif).toEqual({ url: "https://iiif.example.org/image/info.json", attribution: "" });
});

test("does not mistake a slide image for an image basemap", () => {
    // The gate is map_type "iiif": an ordinary storymap's slides can just as
    // easily be IIIF images, and only a basemap one is the map
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [{ type: "Service", profile: "mapconfig", basemap: "stamen" }],
        items: [
            {
                id: "https://example.org/canvas/1",
                type: "Canvas",
                height: 600,
                width: 800,
                items: [
                    {
                        id: "https://example.org/canvas/1/page/1",
                        type: "AnnotationPage",
                        items: [
                            {
                                id: "https://example.org/canvas/1/annotation/1",
                                type: "Annotation",
                                motivation: "painting",
                                body: {
                                    id: "https://iiif.example.org/slide/full/max/0/default.jpg",
                                    type: "Image",
                                    service: [
                                        {
                                            id: "https://iiif.example.org/slide",
                                            type: "ImageService3",
                                        },
                                    ],
                                },
                                target: "https://example.org/canvas/1",
                            },
                        ],
                    },
                ],
            },
        ],
    });
    expect(data.map_type).toBe("stamen");
    expect(data.iiif).toBeUndefined();
});

test("accepts an info.json url used directly as the service id", () => {
    // producer leniency: some manifests put the description URL in service.id
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [{ type: "Service", profile: "mapconfig", basemap: "iiif" }],
        items: [
            {
                id: "https://example.org/canvas/1",
                type: "Canvas",
                height: 3000,
                width: 2315,
                items: [
                    {
                        id: "https://example.org/canvas/1/page/1",
                        type: "AnnotationPage",
                        items: [
                            {
                                id: "https://example.org/canvas/1/annotation/1",
                                type: "Annotation",
                                motivation: "painting",
                                body: {
                                    id: "https://iiif.example.org/image/full/max/0/default.jpg",
                                    type: "Image",
                                    service: [
                                        {
                                            id: "https://iiif.example.org/image/info.json",
                                            type: "ImageService3",
                                        },
                                    ],
                                },
                                target: "https://example.org/canvas/1",
                            },
                        ],
                    },
                ],
            },
        ],
    });
    expect(data.iiif).toEqual({ url: "https://iiif.example.org/image/info.json", attribution: "" });
});

function canvasWith(id: string, headline: string) {
    return {
        id,
        type: "Canvas",
        width: 1080,
        height: 1080,
        label: { none: [headline] },
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
    };
}

test("a Range's label becomes its canvases' slide group", () => {
    // §3.5: this is the first meaning the inert slide.group field ever had
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["Grouped"] },
        structures: [
            {
                id: "https://example.org/range/1",
                type: "Range",
                label: { none: ["Act I"] },
                items: ["https://example.org/canvas/1", "https://example.org/canvas/3"],
            },
            {
                id: "https://example.org/range/2",
                type: "Range",
                label: { none: ["Act II"] },
                items: ["https://example.org/canvas/2"],
            },
        ],
        items: [
            canvasWith("https://example.org/canvas/1", "One"),
            canvasWith("https://example.org/canvas/2", "Two"),
            canvasWith("https://example.org/canvas/3", "Three"),
        ],
    });
    // a grouped storymap reads as its groups, in order
    expect(data.slides.map((s) => [s.text?.headline, s.group])).toEqual([
        ["One", "Act I"],
        ["Three", "Act I"],
        ["Two", "Act II"],
    ]);
});

test("a Range's order is the slide order, not the canvas order", () => {
    // a storyboard is allowed to run the canvases in another order, and that
    // is the one thing it is for
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["Reordered"] },
        structures: [
            {
                type: "Range",
                label: { none: ["Storyboard"] },
                items: ["https://example.org/canvas/3", "https://example.org/canvas/1"],
            },
        ],
        items: [
            canvasWith("https://example.org/canvas/1", "One"),
            canvasWith("https://example.org/canvas/2", "Two"),
            canvasWith("https://example.org/canvas/3", "Three"),
        ],
    });
    // canvas 3 first, then 1; canvas 2 is in no Range and keeps its place after
    expect(data.slides.map((s) => s.text?.headline)).toEqual(["Three", "One", "Two"]);
});

test("a Range with a start is a time segment, not a group", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["Timed"] },
        structures: [
            {
                type: "Range",
                label: { none: ["Part 1"] },
                start: { type: "PointInTime", value: "00:00:00" },
                items: ["https://example.org/canvas/1"],
            },
        ],
        items: [canvasWith("https://example.org/canvas/1", "One")],
    });
    expect(data.slides[0].group).toBeUndefined();
});

test("a nested Range is a chapter inside the outermost group", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["Nested"] },
        structures: [
            {
                type: "Range",
                label: { none: ["Act I"] },
                items: [
                    {
                        type: "Range",
                        label: { none: ["Chapter 1"] },
                        items: ["https://example.org/canvas/1"],
                    },
                    {
                        type: "Range",
                        label: { none: ["Chapter 2"] },
                        items: ["https://example.org/canvas/2"],
                    },
                ],
            },
        ],
        items: [
            canvasWith("https://example.org/canvas/1", "One"),
            canvasWith("https://example.org/canvas/2", "Two"),
        ],
    });
    // slide.group is one string, and the part is more use to a host than the
    // chapter
    expect(data.slides.map((s) => s.group)).toEqual(["Act I", "Act I"]);
});

test("no structures leaves the canvas order alone", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["Plain"] },
        items: [
            canvasWith("https://example.org/canvas/1", "One"),
            canvasWith("https://example.org/canvas/2", "Two"),
        ],
    });
    expect(data.slides.map((s) => [s.text?.headline, s.group])).toEqual([
        ["One", undefined],
        ["Two", undefined],
    ]);
});

test("reads institutional credit onto the one credit line", () => {
    // §3.2: everything the manifest says about who published it and under
    // what licence lands on the string the viewer actually renders
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["Institutional credit"] },
        requiredStatement: {
            label: { none: ["Attribution"] },
            value: { none: ["Courtesy of the Estate"] },
        },
        provider: [
            { id: "https://rijks.example.org/", type: "Agent", label: { none: ["Rijksmuseum"] } },
        ],
        rights: "http://creativecommons.org/publicdomain/zero/1.0/",
        logo: { id: "https://rijks.example.org/logo.png", type: "Image" },
        metadata: [
            { label: { none: ["Date"] }, value: { none: ["1789"] } },
            { label: { none: ["Medium"] }, value: { none: ["oil on canvas"] } },
        ],
        items: [],
    });
    expect((data.iiif as { attribution: string }).attribution).toBe(
        "Attribution: Courtesy of the Estate · Provider: Rijksmuseum · Licence: http://creativecommons.org/publicdomain/zero/1.0/",
    );
    // an image is not a credit line, and pairs cannot be rendered generically,
    // so both are offered as data
    expect(data.logo).toBe("https://rijks.example.org/logo.png");
    expect(data.metadata).toEqual([
        { label: "Date", value: "1789" },
        { label: "Medium", value: "oil on canvas" },
    ]);
});

test("falls back to an Agent's id when it has no label", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["x"] },
        provider: [{ id: "https://example.org/agency", type: "Agent" }],
        items: [],
    });
    expect((data.iiif as { attribution: string }).attribution).toBe(
        "Provider: https://example.org/agency",
    );
});

test("reads a homepage-only Agent as an unlabelled credit fragment", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["x"] },
        homepage: [{ id: "https://example.org/about", type: "Agent" }],
        items: [],
    });
    expect((data.iiif as { attribution: string }).attribution).toBe("https://example.org/about");
});

test("leaves the credit line alone when the manifest says nothing", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["x"] },
        items: [],
    });
    expect(data.iiif).toBeUndefined();
});

test("maps the mapconfig service to storymap options fields", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [
            {
                type: "Service",
                profile: "https://christianmahnke.de/iiif/storymap/mapconfig",
                tilejson: { tiles: "https://tiles.example.org/{z}/{x}/{y}.png" },
                mapAsImage: false,
                mapAccessToken: "token",
                mapBackgroundColor: "#000",
                mapCenterOffset: { left: -100, top: 20 },
                mapSubdomains: "abc",
                fontCss: "stock:bitter",
                callToAction: true,
                callToActionText: "Explore",
                startAtSlide: 2,
                language: "de",
                calculateZoom: false,
                lessBounce: true,
                lineFollowsPath: false,
                showLines: false,
                showHistoryLine: false,
                lineColorInactive: "#ccc",
                lineDash: "1,2",
                lineJoin: "round",
                useCustomMarkers: true,
                originalZoomify: { path: "https://old.example.org/tiles" },
            },
        ],
        items: [],
    });

    expect(data.map_type).toBe("https://tiles.example.org/{z}/{x}/{y}.png");
    expect(data.map_as_image).toBe(false);
    expect(data.map_access_token).toBe("token");
    expect(data.map_background_color).toBe("#000");
    expect(data.map_center_offset).toEqual({ left: -100, top: 20 });
    expect(data.map_subdomains).toBe("abc");
    // iiif.url no longer comes from a mapconfig term, so a map_type that is
    // not an image map leaves it unset
    expect(data.iiif).toBeUndefined();
    expect(data.font_css).toBe("stock:bitter");
    expect(data.call_to_action).toBe(true);
    expect(data.call_to_action_text).toBe("Explore");
    expect(data.start_at_slide).toBe(2);
    expect(data.language).toBe("de");
    expect(data.calculate_zoom).toBe(false);
    expect(data.less_bounce).toBe(true);
    expect(data.line_follows_path).toBe(false);
    expect(data.show_lines).toBe(false);
    expect(data.show_history_line).toBe(false);
    expect(data.line_color_inactive).toBe("#ccc");
    expect(data.line_dash).toBe("1,2");
    expect(data.line_join).toBe("round");
    expect(data.use_custom_markers).toBe(true);
    // legacy zoomify options are not carried from manifests (the viewer
    // deletes options.zoomify for manifest sources)
    expect(data.zoomify).toBeUndefined();
});

test("keeps the requiredStatement label, not just the value", () => {
    // a real-world manifest labels its statement; reading only `.value` threw
    // that half away (iiif-interop.md §2.1)
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        requiredStatement: {
            label: { none: ["Attribution"] },
            value: { none: ["Courtesy of Example"] },
        },
        items: [],
    });
    expect(data.iiif).toEqual({ url: "", attribution: "Attribution: Courtesy of Example" });
});

test("an unlabelled requiredStatement is still the bare value", () => {
    // plenty of manifests state a bare rights line; prefixing it would be noise
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        requiredStatement: { value: { none: ["In the public domain"] } },
        items: [],
    });
    expect(data.iiif).toEqual({ url: "", attribution: "In the public domain" });
});

test("a labelled requiredStatement keeps a language-tagged label", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        requiredStatement: {
            label: { en: ["Rights holder"], de: ["Rechteinhaber"] },
            value: { en: ["Example Institution"] },
        },
        items: [],
    });
    // flattenLanguageMap's current behaviour: every language, concatenated
    const attribution = (data.iiif as { attribution?: string }).attribution ?? "";
    expect(attribution).toContain("Example Institution");
    expect(attribution).toContain("Rights holder");
});

test("a body requiredStatement keeps its label too", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            {
                "@type": "Canvas",
                id: "https://example.org/canvas/1",
                items: [
                    {
                        "@type": "AnnotationPage",
                        items: [
                            {
                                "@type": "Annotation",
                                motivation: "painting",
                                body: {
                                    id: "https://example.org/img.jpg",
                                    type: "Image",
                                    requiredStatement: {
                                        label: { none: ["Photographer"] },
                                        value: { none: ["A Photographer"] },
                                    },
                                },
                                target: "https://example.org/canvas/1",
                            },
                        ],
                    },
                ],
            },
        ],
    });
    expect(data.slides[0].media?.credit).toBe("Photographer: A Photographer");
});

test("a Collection is not accepted as a Manifest", () => {
    // detection used to accept anything carrying the P3 context, so a
    // Collection passed and its member Manifests were read as if they were
    // Canvases (iiif-interop.md §2.2)
    const collection = {
        "@context": CONTEXTS,
        id: "https://example.org/collection",
        type: "Collection",
        label: { none: ["A collection"] },
        items: [],
    };
    expect(isPresentation3Manifest(collection)).toBe(false);
    expect(isPresentation3Collection(collection)).toBe(true);
    // and a plain Manifest is still one
    expect(isPresentation3Manifest({ "@context": CONTEXTS, type: "Manifest" })).toBe(true);
});

test("a Collection is reported and yields no slides, not mangled ones", () => {
    // §2.2: a Collection's members are id references to other documents, so a
    // synchronous converter cannot flatten them. What it must not do is the old
    // behaviour — read each member as if it were a Canvas, producing text-only
    // slides with no media and no warning.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
        const data = manifestToStorymapData({
            "@context": CONTEXTS,
            id: "https://example.org/collection",
            type: "Collection",
            label: { none: ["Two manifests"] },
            requiredStatement: {
                label: { none: ["Attribution"] },
                value: { none: ["Example Institution"] },
            },
            items: ["https://example.org/m1", "https://example.org/m2"],
        });
        expect(data.slides).toEqual([]);
        // the label and the labelled statement are still real information
        expect(data.title).toBe("Two manifests");
        expect((data.iiif as { attribution?: string }).attribution).toContain(
            "Example Institution",
        );
        // and the gap is named, with both members, rather than silent
        expect(warn).toHaveBeenCalledTimes(1);
        const message = String(warn.mock.calls[0][0]);
        expect(message).toContain("Collection");
        expect(message).toContain("https://example.org/m1");
        expect(message).toContain("https://example.org/m2");
    } finally {
        warn.mockRestore();
    }
});

test("a canvas is addressable by its canonical id, and so is a tour stop", () => {
    // §2.3: the viewer already resolves deep links by `uniqueid`
    // (`StorySlider.goToId`) and generated one because the converter never set
    // it, so a stop could not be shared by its own id.
    const canvasId = "https://example.org/canvas/1";
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        items: [
            {
                id: canvasId,
                type: "Canvas",
                width: 2000,
                height: 1000,
                items: [
                    {
                        id: `${canvasId}/page/1`,
                        type: "AnnotationPage",
                        items: [
                            {
                                id: `${canvasId}/a/1`,
                                type: "Annotation",
                                motivation: "painting",
                                body: { id: "https://example.org/i.jpg", type: "Image" },
                                target: canvasId,
                            },
                        ],
                    },
                    {
                        id: `${canvasId}/page/2`,
                        type: "AnnotationPage",
                        items: [
                            {
                                id: `${canvasId}/a/2`,
                                type: "Annotation",
                                motivation: "commenting",
                                body: { type: "TextualBody", value: "A stop", format: "text/html" },
                                target: `${canvasId}#xywh=100,200,300,400`,
                            },
                        ],
                    },
                ],
            },
            { id: "https://example.org/canvas/2", type: "Canvas", items: [] },
        ],
    });
    const ids = data.slides.map((slide) => slide.uniqueid);
    expect(ids).toHaveLength(3);
    expect(ids[0]).toBe(canvasId);
    // the annotation stop: same canvas, its own addressable id
    expect(ids[1]).toBe(`${canvasId}#1`);
    expect(ids[2]).toBe("https://example.org/canvas/2");
    // every id is unique, or goToId would resolve ambiguously
    expect(new Set(ids).size).toBe(ids.length);
});

test("a canvas without an id falls back to the manifest id", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        id: "https://example.org/manifest",
        type: "Manifest",
        items: [{ "@type": "Canvas", items: [] }],
    });
    expect(data.slides[0].uniqueid).toBe("https://example.org/manifest");
});

test("a manifest with neither id leaves the slider to generate one", () => {
    // StorySlider generates when uniqueid is falsy, which is what it did
    // before this change — the point is that we do not now write "undefined"
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        type: "Manifest",
        items: [{ "@type": "Canvas", items: [] }],
    });
    expect(data.slides[0].uniqueid).toBe("");
});

test("maps the newer mapconfig terms to their storymap fields", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [
            {
                type: "Service",
                profile: "mapconfig",
                basemap: "osm",
                mapArea: "left",
                overviewExtent: [-0.6, 51.2, 0.4, 51.8],
                keyboard: true,
                overlays: [
                    { map_type: "https://tiles.example.org/a/{z}/{x}/{y}.png", opacity: 0.5 },
                    {
                        map_type: "https://tiles.example.org/b/{z}/{x}/{y}.png",
                        visible: false,
                        className: "ol-layer historic",
                        blendMode: "multiply",
                        extent: [-0.4, 51.3, 0.2, 51.7],
                        attribution: "Second sheet",
                    },
                    // dropped: no map_type (and no georeference)
                    { opacity: 0.2 },
                    "not an object",
                ],
            },
        ],
        items: [],
    });

    expect(data.map_area).toBe("left");
    expect(data.overview_extent).toEqual([-0.6, 51.2, 0.4, 51.8]);
    expect(data.keyboard).toBe(true);
    expect(data.overlays).toEqual([
        { map_type: "https://tiles.example.org/a/{z}/{x}/{y}.png", opacity: 0.5 },
        {
            map_type: "https://tiles.example.org/b/{z}/{x}/{y}.png",
            visible: false,
            className: "ol-layer historic",
            blendMode: "multiply",
            extent: [-0.4, 51.3, 0.2, 51.7],
            attribution: "Second sheet",
        },
    ]);
});

test("ignores malformed mapconfig terms", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [
            {
                type: "Service",
                profile: "mapconfig",
                mapArea: "sideways",
                overviewExtent: [1, 2, 3],
                keyboard: "yes",
                overlays: "not an array",
            },
        ],
        items: [],
    });

    expect(data.map_area).toBeUndefined();
    expect(data.overview_extent).toBeUndefined();
    expect(data.keyboard).toBeUndefined();
    expect(data.overlays).toBeUndefined();
});

test("maps mediaSrcset and mediaSizes to the slide media", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            {
                type: "Canvas",
                items: [
                    {
                        type: "AnnotationPage",
                        items: [
                            {
                                type: "Annotation",
                                motivation: "painting",
                                body: { id: "https://example.org/i.jpg", type: "Image" },
                                target: "https://example.org/canvas/1",
                            },
                        ],
                    },
                ],
                "storymap:mediaSrcset": "https://example.org/i-480.jpg 480w",
                "storymap:mediaSizes": "50vw",
            },
        ],
    });

    expect(data.slides[0].media).toEqual({
        url: "https://example.org/i.jpg",
        srcset: "https://example.org/i-480.jpg 480w",
        sizes: "50vw",
    });
});

test("reads an image region from an IIIF Image API Selector", () => {
    const canvas = (target: unknown) => ({
        type: "Canvas",
        items: [
            {
                type: "AnnotationPage",
                items: [
                    {
                        type: "Annotation",
                        motivation: "painting",
                        body: { id: "https://example.org/i.jpg", type: "Image" },
                        target,
                    },
                ],
            },
        ],
    });

    const selector = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            canvas({
                source: "https://example.org/canvas/1",
                type: "SpecificResource",
                selector: { type: "ImageApiSelector", value: "xywh=100,200,800,600" },
            }),
            canvas({
                source: "https://example.org/canvas/2",
                type: "SpecificResource",
                selector: { type: "FragmentSelector", value: "#xywh=10,20,30,40" },
            }),
            // unsupported selector: ignored
            canvas({
                source: "https://example.org/canvas/3",
                type: "SpecificResource",
                selector: { type: "SvgSelector", value: "<svg><rect/></svg>" },
            }),
            // malformed value: ignored
            canvas({
                source: "https://example.org/canvas/4",
                type: "SpecificResource",
                selector: { type: "ImageApiSelector", value: "xywh=1,2,3" },
            }),
        ],
    });

    expect(selector.slides[0].location?.region).toEqual([100, 200, 800, 600]);
    expect(selector.slides[1].location?.region).toEqual([10, 20, 30, 40]);
    expect(selector.slides[2].location?.region).toBeUndefined();
    expect(selector.slides[3].location?.region).toBeUndefined();
});

test("an image API selector wins over an imageRegion term left over from §2.8", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            {
                type: "Canvas",
                "storymap:imageRegion": [0, 0, 111, 222],
                items: [
                    {
                        type: "AnnotationPage",
                        items: [
                            {
                                type: "Annotation",
                                motivation: "painting",
                                body: { id: "https://example.org/i.jpg", type: "Image" },
                                target: {
                                    source: "https://example.org/canvas/1",
                                    type: "SpecificResource",
                                    selector: { type: "ImageApiSelector", value: "xywh=5,5,50,50" },
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    });

    // The term is no longer read at all, so the selector is the only source
    expect(data.slides[0].location?.region).toEqual([5, 5, 50, 50]);
});

test("reads a region from a pixel= selector", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            {
                type: "Canvas",
                width: 2315,
                height: 3000,
                items: [
                    {
                        type: "AnnotationPage",
                        items: [
                            {
                                type: "Annotation",
                                motivation: "painting",
                                body: { id: "https://example.org/i.jpg", type: "Image" },
                                target: {
                                    source: "https://example.org/canvas/1",
                                    type: "SpecificResource",
                                    selector: {
                                        type: "ImageApiSelector",
                                        value: "xywh=pixel:800,100,700,700",
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    });

    expect(data.slides[0].location?.region).toEqual([800, 100, 700, 700]);
});

test("maps a polygon navPlace to map_bbox", () => {
    const polygon = (coordinates: number[][][]) => ({
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates } }],
    });
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            {
                type: "Canvas",
                navPlace: polygon([
                    [
                        [4.44, 51.895],
                        [4.51, 51.895],
                        [4.51, 51.925],
                        [4.44, 51.895],
                    ],
                ]),
            },
            // a later canvas does not override the first polygon
            {
                type: "Canvas",
                navPlace: polygon([
                    [
                        [0, 0],
                        [1, 0],
                        [1, 1],
                        [0, 0],
                    ],
                ]),
            },
        ],
    });

    expect(data.map_bbox).toEqual([4.44, 51.895, 4.51, 51.925]);
    // polygons carry no marker position
    expect(data.slides[0].location).toBeUndefined();
});

test("point navPlaces are unaffected by the polygon mapping", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            {
                type: "Canvas",
                navPlace: {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            properties: { name: "Rotterdam" },
                            geometry: { type: "Point", coordinates: [4.4777, 51.9166] },
                        },
                    ],
                },
            },
        ],
    });

    expect(data.map_bbox).toBeUndefined();
    expect(data.slides[0].location?.lat).toBe(51.9166);
    expect(data.slides[0].location?.lon).toBe(4.4777);
    expect(data.slides[0].location?.name).toBe("Rotterdam");
});

test("maps georeferencing annotations to overlays", () => {
    const body = {
        type: "FeatureCollection",
        transformation: { type: "polynomial", options: { order: 1 } },
        features: [
            { properties: { resourceCoords: [0, 0] }, geometry: { coordinates: [4.45, 51.92] } },
            {
                properties: { resourceCoords: [2315, 0] },
                geometry: { coordinates: [4.5, 51.92] },
            },
            {
                properties: { resourceCoords: [0, 3000] },
                geometry: { coordinates: [4.45, 51.9] },
            },
        ],
    };
    // The extension's own spelling: the image to place is embedded in the
    // target, because a map layer is external to the canvas it ships in
    const georeferencing = (id: string, target: unknown, gcpBody: unknown) => ({
        id,
        type: "Annotation",
        motivation: "georeferencing",
        target,
        body: gcpBody,
    });
    const imageTarget = (url: string, width: number, height: number) => ({
        id: url,
        type: "Image",
        width,
        height,
        service: [{ id: url, type: "ImageService3", profile: "level2" }],
    });
    const canvas = (id: string, annotations: unknown[]) => ({
        id,
        type: "Canvas",
        width: 1080,
        height: 1080,
        items: [{ id: `${id}/page/1`, type: "AnnotationPage", items: annotations }],
    });
    const painting = (canvasId: string) => ({
        id: `${canvasId}/annotation/1`,
        type: "Annotation",
        motivation: "painting",
        body: { id: "https://example.org/i.jpg", type: "Image" },
        target: canvasId,
    });
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [{ type: "Service", profile: "mapconfig", basemap: "osm" }],
        items: [
            canvas("https://example.org/canvas/1", [
                painting("https://example.org/canvas/1"),
                georeferencing(
                    "https://example.org/layer/1",
                    imageTarget("https://iiif.example.org/image1", 2315, 3000),
                    body,
                ),
                // too few control points: dropped
                georeferencing(
                    "https://example.org/layer/2",
                    imageTarget("https://iiif.example.org/image2", 100, 100),
                    { type: "FeatureCollection", features: body.features.slice(0, 2) },
                ),
                // no image size: dropped
                georeferencing(
                    "https://example.org/layer/3",
                    { id: "https://iiif.example.org/image3", type: "Image" },
                    body,
                ),
            ]),
            canvas("https://example.org/canvas/2", [painting("https://example.org/canvas/2")]),
        ],
    });

    const entries = data.overlays as StorymapOverlayLayer[];
    expect(entries).toHaveLength(1);
    const entry = entries[0];
    expect(entry.map_type).toBeUndefined();
    expect(entry.georeference?.url).toBe("https://iiif.example.org/image1");
    expect(entry.georeference?.width).toBe(2315);
    expect(entry.georeference?.body.transformation).toEqual({
        type: "polynomial",
        options: { order: 1 },
    });
});

test("a georeferencing annotation on the first canvas is still map-wide", () => {
    // The trap §2.10 warns about: the annotation is canvas-scoped but the layer
    // it describes belongs on the map for the whole story. Reading it must not
    // attach it to the slide whose canvas carried it, and must not need it
    // repeated on every canvas.
    const canvas = (id: string, extra: unknown[] = []) => ({
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
                    ...extra,
                ],
            },
        ],
    });
    const layer = {
        id: "https://example.org/canvas/1/georeferencing/1",
        type: "Annotation",
        motivation: "georeferencing",
        target: {
            id: "https://iiif.example.org/image1",
            type: "Image",
            width: 2315,
            height: 3000,
        },
        body: {
            type: "FeatureCollection",
            features: [
                {
                    properties: { resourceCoords: [0, 0] },
                    geometry: { coordinates: [4.45, 51.92] },
                },
                {
                    properties: { resourceCoords: [2315, 0] },
                    geometry: { coordinates: [4.5, 51.92] },
                },
                {
                    properties: { resourceCoords: [0, 3000] },
                    geometry: { coordinates: [4.45, 51.9] },
                },
            ],
        },
    };
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        items: [
            canvas("https://example.org/canvas/1", [layer]),
            canvas("https://example.org/canvas/2"),
            canvas("https://example.org/canvas/3"),
        ],
    });

    // one map-wide layer, not one per slide
    const entries = data.overlays as StorymapOverlayLayer[];
    expect(entries).toHaveLength(1);
    expect(entries[0].georeference?.url).toBe("https://iiif.example.org/image1");
    // and it belongs to no slide: the layer is not slide state
    expect(data.slides).toHaveLength(3);
    expect(data.slides[1].overlays).toBeUndefined();
    expect(data.slides[2].overlays).toBeUndefined();
});

test("a georeferencing annotation's requiredStatement is the layer's attribution", () => {
    const canvas = {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        width: 1080,
        height: 1080,
        items: [
            {
                id: "https://example.org/canvas/1/page/1",
                type: "AnnotationPage",
                items: [
                    {
                        id: "https://example.org/canvas/1/layer/1",
                        type: "Annotation",
                        motivation: "georeferencing",
                        requiredStatement: {
                            label: { none: ["Attribution"] },
                            value: { none: ["Placed sheet"] },
                        },
                        target: {
                            id: "https://iiif.example.org/image1",
                            type: "Image",
                            width: 2315,
                            height: 3000,
                        },
                        body: {
                            type: "FeatureCollection",
                            features: [
                                {
                                    properties: { resourceCoords: [0, 0] },
                                    geometry: { coordinates: [4.45, 51.92] },
                                },
                                {
                                    properties: { resourceCoords: [2315, 0] },
                                    geometry: { coordinates: [4.5, 51.92] },
                                },
                                {
                                    properties: { resourceCoords: [0, 3000] },
                                    geometry: { coordinates: [4.45, 51.9] },
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    };
    const data = manifestToStorymapData({ "@context": CONTEXTS, items: [canvas] });
    const entries = data.overlays as StorymapOverlayLayer[];
    expect(entries[0].attribution).toBe("Attribution: Placed sheet");
});

test("ignores a georeferencedLayers term left over from before §2.10", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [
            {
                type: "Service",
                profile: "mapconfig",
                basemap: "osm",
                georeferencedLayers: [
                    {
                        url: "https://iiif.example.org/image1",
                        width: 2315,
                        height: 3000,
                        body: {
                            type: "FeatureCollection",
                            features: [
                                {
                                    properties: { resourceCoords: [0, 0] },
                                    geometry: { coordinates: [4.45, 51.92] },
                                },
                                {
                                    properties: { resourceCoords: [2315, 0] },
                                    geometry: { coordinates: [4.5, 51.92] },
                                },
                                {
                                    properties: { resourceCoords: [0, 3000] },
                                    geometry: { coordinates: [4.45, 51.9] },
                                },
                            ],
                        },
                    },
                ],
            },
        ],
        items: [],
    });
    expect(data.overlays).toBeUndefined();
});

test("the shipped georeferenced-layer manifest maps as documented", () => {
    const manifest = JSON.parse(
        readFileSync(join(process.cwd(), "public/examples-iiif/georeferenced-layer.json"), "utf8"),
    );
    const data = manifestToStorymapData(manifest);

    expect(data.slides).toHaveLength(2);
    expect(data.map_bbox).toEqual([4.44, 51.895, 4.51, 51.925]);
    expect(data.overview_extent).toEqual([4.3, 51.85, 4.6, 51.98]);
    expect(data.map_area).toBe("full");
    const entries = data.overlays as StorymapOverlayLayer[];
    expect(entries).toHaveLength(1);
    const georeference = entries[0].georeference;
    expect(georeference?.url).toContain("iiif.io/api/image/3.0/example/reference");
    const fit = fitGeoreference(georeference!.body, georeference!.width, georeference!.height);
    expect(fit.kind).toBe("placed");
    if (fit.kind === "placed") {
        expect(fit.bbox[0]).toBeCloseTo(4.45, 3);
        expect(fit.bbox[1]).toBeCloseTo(51.9, 3);
        expect(fit.bbox[2]).toBeCloseTo(4.5, 3);
        expect(fit.bbox[3]).toBeCloseTo(51.92, 3);
    }
});

describe("every shipped IIIF fixture", () => {
    const dir = join(process.cwd(), "public/examples-iiif");
    const fixtures = readdirSync(dir)
        .filter((name) => name.endsWith(".json"))
        .sort();

    test("finds the fixtures", () => {
        // guards the guard below: an empty glob would pass vacuously
        expect(fixtures.length).toBeGreaterThan(40);
    });

    test("converts without throwing and every slide is addressable", () => {
        // §2.3 made `uniqueid` meaningful, so a duplicate or missing id is now
        // a real defect: `StorySlider.goToId` resolves by first match, so a
        // duplicate silently navigates to the wrong stop.
        let slideCount = 0;
        for (const name of fixtures) {
            const manifest = JSON.parse(readFileSync(join(dir, name), "utf8"));
            const data = manifestToStorymapData(manifest);
            const ids = data.slides.map((slide) => slide.uniqueid ?? "");
            slideCount += ids.length;
            const nonEmpty = ids.filter((id) => id !== "");
            expect(new Set(nonEmpty).size, `duplicate uniqueid in ${name}`).toBe(nonEmpty.length);
            for (const id of ids) {
                expect(id, `bad uniqueid in ${name}`).not.toContain("undefined");
            }
        }
        expect(slideCount).toBeGreaterThan(50);
    });

    test("no fixture is a Collection, which is now rejected as a Manifest", () => {
        // §2.2: a Collection used to be accepted and mangled
        for (const name of fixtures) {
            const manifest = JSON.parse(readFileSync(join(dir, name), "utf8"));
            expect(isPresentation3Collection(manifest), `${name} is a Collection`).toBe(false);
        }
    });
});
