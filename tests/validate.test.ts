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
