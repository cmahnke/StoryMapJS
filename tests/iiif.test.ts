import { test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isPresentation3Manifest, manifestToStorymapData } from "../src/storymap/iiif";
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
    // legacy zoomify options are not carried from manifests (the viewer
    // deletes options.zoomify for manifest sources)
    expect(data.zoomify).toBeUndefined();
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

test("maps the newer mapconfig terms to their storymap fields", () => {
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [
            {
                type: "Service",
                profile: "mapconfig",
                mapType: "osm",
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

test("the extension term wins over an image API selector", () => {
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

    expect(data.slides[0].location?.region).toEqual([0, 0, 111, 222]);
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

test("maps georeferenced layers to overlays", () => {
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
    const data = manifestToStorymapData({
        "@context": CONTEXTS,
        service: [
            {
                type: "Service",
                profile: "mapconfig",
                mapType: "osm",
                georeferencedLayers: [
                    {
                        id: "https://example.org/layer/1",
                        url: "https://iiif.example.org/image1",
                        width: 2315,
                        height: 3000,
                        opacity: 0.75,
                        attribution: "Placed sheet",
                        body,
                    },
                    // too few control points: dropped
                    {
                        url: "https://iiif.example.org/image2",
                        width: 100,
                        height: 100,
                        body: { type: "FeatureCollection", features: body.features.slice(0, 2) },
                    },
                    // no image size: dropped
                    { url: "https://iiif.example.org/image3", body },
                ],
            },
        ],
        items: [],
    });

    const entries = data.overlays as StorymapOverlayLayer[];
    expect(entries).toHaveLength(1);
    const entry = entries[0];
    expect(entry.map_type).toBeUndefined();
    expect(entry.opacity).toBe(0.75);
    expect(entry.attribution).toBe("Placed sheet");
    expect(entry.georeference?.url).toBe("https://iiif.example.org/image1");
    expect(entry.georeference?.width).toBe(2315);
    expect(entry.georeference?.body.transformation).toEqual({
        type: "polynomial",
        options: { order: 1 },
    });
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
