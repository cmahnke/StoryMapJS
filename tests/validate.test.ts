import { test, expect } from "vitest";
import { validateStorymap } from "../src/storymap/validate";

const valid = {
    storymap: {
        map_type: "osm:standard",
        slides: [
            {
                location: { lat: 51.5, lon: -0.12 },
                media: { url: "https://example.com/i.jpg", caption: "", credit: "" },
                text: { headline: "London", text: "A city." },
            },
        ],
    },
};

test("accepts a well-formed storymap", () => {
    expect(validateStorymap(valid)).toEqual([]);
});

test("accepts an overview-only storymap with no slides content", () => {
    expect(validateStorymap({ storymap: { slides: [] } })).toEqual([]);
});

test("requires the storymap wrapper", () => {
    const errors = validateStorymap({ slides: [] });
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("storymap");
});

test("requires slides", () => {
    const errors = validateStorymap({ storymap: {} });
    expect(errors.length).toBe(1);
    expect(errors[0].path).toBe(".storymap");
    expect(errors[0].message).toContain("slides");
});

test("reports all errors, not just the first", () => {
    const data: Record<string, unknown> = {
        storymap: {
            map_as_image: "yes", // wrong type
            iiif: {}, // missing url
            slides: [
                { location: { lat: "not a number", lon: 0 } },
                { location: { lat: 1, lon: 2 }, media: { credit: null, caption: null } },
            ],
        },
    };
    const errors = validateStorymap(data);
    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(errors.some((e) => e.path.includes("map_as_image"))).toBe(true);
    expect(errors.some((e) => e.path.includes("iiif"))).toBe(true);
    expect(errors.some((e) => e.path.includes("lat"))).toBe(true);
});

test("accepts null string fields (loose real-world data)", () => {
    const data: Record<string, unknown> = {
        storymap: {
            slides: [
                {
                    date: null,
                    media: { url: null, caption: null, credit: null },
                    background: { url: null, color: null },
                },
            ],
        },
    };
    expect(validateStorymap(data)).toEqual([]);
});

test("accepts the map_area, overlays, overview_extent and keyboard options", () => {
    const data: Record<string, unknown> = {
        storymap: {
            map_type: "osm",
            map_area: "left",
            overview_extent: [-0.6, 51.2, 0.4, 51.8],
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
            ],
            slides: [
                {
                    location: { lat: 51.5, lon: -0.12, region: [0, 0, 800, 600] },
                    media: {
                        url: "https://example.com/i.jpg",
                        alt: "A map",
                        srcset: "https://example.com/i-480.jpg 480w",
                        sizes: "50vw",
                    },
                },
            ],
        },
    };
    expect(validateStorymap(data)).toEqual([]);
});

test("rejects malformed overlays, map_area and overview_extent", () => {
    const data: Record<string, unknown> = {
        storymap: {
            map_area: "sideways",
            overview_extent: [1, 2, 3],
            overlays: [
                { opacity: 0.5 }, // neither map_type nor georeference
                { map_type: "osm", opacity: 4 }, // out of range
                { map_type: "osm", extent: [1, 2, 3] }, // not four numbers
                { georeference: { url: "https://example.org/i", width: 10, height: 10, body: {} } },
            ],
            slides: [],
        },
    };
    const errors = validateStorymap(data);
    expect(errors.some((e) => e.path.includes("map_area"))).toBe(true);
    expect(errors.some((e) => e.path.includes("overview_extent"))).toBe(true);
    // an entry needs a map_type or a georeference, and the georeference needs
    // a body that is a FeatureCollection of points
    expect(errors.filter((e) => e.path.includes("overlays")).length).toBeGreaterThanOrEqual(3);
});

test("an overlays entry may carry a georeference instead of a map_type", () => {
    // §2.10 moved the placed rasters to Georeference Extension annotations;
    // storymap-JSON still has to be able to say one
    const valid = {
        storymap: {
            overlays: [
                {
                    georeference: {
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
                            ],
                        },
                    },
                    opacity: 0.75,
                },
            ],
            slides: [],
        },
    };
    expect(validateStorymap(valid).filter((e) => e.path.includes("overlays"))).toEqual([]);

    const missingSize = {
        storymap: {
            overlays: [{ georeference: { url: "https://iiif.example.org/image1" } }],
            slides: [],
        },
    };
    expect(
        validateStorymap(missingSize).filter((e) => e.path.includes("georeference")).length,
    ).toBeGreaterThan(0);
});

/*	anyOf / format coverage
	`anyOf` was not implemented at all, so map_bbox, map_overview_center and
	the legacy zoomify block were accepted completely unvalidated — including
	map_bbox's "exactly four numbers" rule, which the runtime depends on.
================================================== */

test("anyOf: map_bbox must have exactly four numbers", () => {
    const data = {
        storymap: {
            map_type: "osm",
            map_bbox: [1, 2, 3],
            slides: [],
        },
    };
    const errors = validateStorymap(data);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((e) => e.path).join()).toContain("map_bbox");
});

test("anyOf: a valid map_bbox still passes", () => {
    const data = {
        storymap: {
            map_type: "osm",
            map_bbox: [-180, -85, 180, 85],
            slides: [],
        },
    };
    expect(validateStorymap(data)).toEqual([]);
});

test("anyOf: map_overview_center rejects a non-object, non-null value", () => {
    // note: the schema's object branch has no "required", so a partial
    // { lat } *is* valid by design — this only pins the branch selection.
    const data = {
        storymap: {
            map_type: "osm",
            map_overview_center: "somewhere",
            slides: [],
        },
    };
    const errors = validateStorymap(data);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((e) => e.path).join()).toContain("map_overview_center");
});

test("anyOf: map_bbox may be null (the documented default)", () => {
    const data = {
        storymap: { map_type: "osm", map_bbox: null, slides: [] },
    };
    // null is the default value, so it must not be an error
    expect(
        validateStorymap(data)
            .map((e) => e.path)
            .join(),
    ).not.toContain("map_bbox");
});

test("format: a malformed location icon URL is reported", () => {
    const data = {
        storymap: {
            map_type: "osm",
            slides: [
                {
                    text: { headline: "x", text: "" },
                    media: { url: "" },
                    location: { lat: 1, lon: 2, icon: "http://" },
                },
            ],
        },
    };
    const errors = validateStorymap(data);
    expect(errors.length).toBeGreaterThan(0);
});
