import { test, expect } from "vitest";
import { isPresentation3Manifest, manifestToStorymapData } from "../src/storymap/iiif";
import type { StorymapData } from "../src/types";

const CONTEXTS = [
    "http://iiif.io/api/presentation/3/context.json",
    "http://iiif.io/api/extension/navplace/context.json",
    "https://christianmahnke.de/iiif/storymap",
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
            "storymap:mapType": "osm:standard",
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
            "storymap:date": "Sep 1",
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
            "storymap:mediaCaption": "Landfall",
            "storymap:mediaCredit": "Weather Service",
            "storymap:background": { url: "https://example.org/bg.jpg", opacity: 25 },
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
    expect(landfall.media?.credit).toBe("Weather Service");
    expect(landfall.background).toEqual({ url: "https://example.org/bg.jpg", opacity: 25 });
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

test("maps the mapconfig service to storymap options fields", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [
            {
                type: "Service",
                profile: "https://christianmahnke.de/iiif/storymap/mapconfig",
                mapType: "https://tiles.example.org/{z}/{x}/{y}.png",
                mapAsImage: false,
                mapAccessToken: "token",
                mapBackgroundColor: "#000",
                mapCenterOffset: { left: -100, top: 20 },
                mapSubdomains: "abc",
                iiifUrl: "https://iiif.example.org/info.json",
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
    expect(data.iiif).toEqual({ url: "https://iiif.example.org/info.json", attribution: "" });
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
    expect(data.zoomify).toEqual({ path: "https://old.example.org/tiles" });
});

test("maps requiredStatement to iiif.attribution", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        requiredStatement: {
            label: { none: ["Attribution"] },
            value: { none: ["Courtesy of Example"] },
        },
        items: [],
    });
    expect(data.iiif).toEqual({ url: "", attribution: "Courtesy of Example" });
});
