import { describe, expect, it } from "vitest";
import {
    applyAffine,
    fitAffine,
    fitGeoreference,
    readGroundControlPoints,
    resolveInfoJsonUrl,
    unsupportedTransformation,
} from "../src/map/georeference";
import type { StorymapGeoreferenceBody } from "../src/types";

/**
 * Affine placement of a IIIF image from Georeference Extension ground
 * control points: the fit recovers the transform, rejects what an
 * axis-aligned placement cannot draw, and yields the geographic extent the
 * layer is placed in.
 */
describe("georeference affine fit", () => {
    const LAOCOON = { width: 2315, height: 3000 };

    /** The synthetic placement used by public/examples-iiif/georeferenced-layer.json */
    function placedSheet(): StorymapGeoreferenceBody {
        return {
            type: "FeatureCollection",
            transformation: { type: "polynomial", options: { order: 1 } },
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
                    properties: { resourceCoords: [2315, 3000] },
                    geometry: { coordinates: [4.5, 51.9] },
                },
                {
                    properties: { resourceCoords: [0, 3000] },
                    geometry: { coordinates: [4.45, 51.9] },
                },
                {
                    properties: { resourceCoords: [1157, 1500] },
                    geometry: { coordinates: [4.474989, 51.91] },
                },
            ],
        } as StorymapGeoreferenceBody;
    }

    it("recovers the transform from a known placement", () => {
        const points = readGroundControlPoints(placedSheet());
        expect(points).not.toBeNull();
        const transform = fitAffine(points!);
        expect(transform).not.toBeNull();
        const [a, b, c, d] = transform!;
        // 0.05° of longitude across 2315 px, 0.02° of latitude down 3000 px
        expect(a).toBeCloseTo(0.05 / 2315, 12);
        expect(b).toBeCloseTo(0, 12);
        expect(c).toBeCloseTo(0, 12);
        expect(d).toBeCloseTo(-0.02 / 3000, 12);
        const [lon, lat] = applyAffine(transform!, 1157, 1500);
        expect(lon).toBeCloseTo(4.474989, 6);
        expect(lat).toBeCloseTo(51.91, 6);
    });

    it("places the image in the geographic bbox of its corners", () => {
        const fit = fitGeoreference(placedSheet(), LAOCOON.width, LAOCOON.height);
        expect(fit.kind).toBe("placed");
        if (fit.kind !== "placed") return;
        expect(fit.bbox[0]).toBeCloseTo(4.45, 6);
        expect(fit.bbox[1]).toBeCloseTo(51.9, 6);
        expect(fit.bbox[2]).toBeCloseTo(4.5, 6);
        expect(fit.bbox[3]).toBeCloseTo(51.92, 6);
        expect(fit.residual).toBeLessThan(1e-6);
    });

    it("reads only the well-formed control points", () => {
        const body = {
            type: "FeatureCollection",
            features: [
                { properties: { resourceCoords: [0, 0] }, geometry: { coordinates: [4, 51] } },
                // missing resourceCoords
                { properties: {}, geometry: { coordinates: [4.1, 51.1] } },
                // non-numeric coordinates
                {
                    properties: { resourceCoords: [10, 10] },
                    geometry: { coordinates: ["4.2", 51.2] },
                },
                {
                    properties: { resourceCoords: [20, 20] },
                    geometry: { coordinates: [4.3, 51.3] },
                },
                {
                    properties: { resourceCoords: [30, 30] },
                    geometry: { coordinates: [4.4, 51.4] },
                },
            ],
        };
        const points = readGroundControlPoints(body);
        expect(points).toHaveLength(3);
        expect(points![2].pixel).toEqual([30, 30]);
        // fewer than three points do not determine a transform
        expect(readGroundControlPoints({ features: body.features.slice(0, 2) })).toBeNull();
        expect(readGroundControlPoints({})).toBeNull();
        expect(readGroundControlPoints(null)).toBeNull();
        expect(
            fitGeoreference(
                { features: body.features.slice(0, 2) } as StorymapGeoreferenceBody,
                100,
                100,
            ).kind,
        ).toBe("skipped");
    });

    it("skips transformations the affine placement cannot honour", () => {
        const base = placedSheet();
        expect(unsupportedTransformation(base)).toBeNull();
        expect(
            unsupportedTransformation({
                features: [],
                transformation: { type: "thinPlateSpline" },
            }),
        ).toContain("thinPlateSpline");
        expect(
            unsupportedTransformation({
                features: [],
                transformation: { type: "polynomial", options: { order: 2 } },
            }),
        ).toContain("order 2");
        // an absent order defaults to 1 in the extension
        expect(
            unsupportedTransformation({ features: [], transformation: { type: "polynomial" } }),
        ).toBeNull();

        const warped = fitGeoreference(
            { ...base, transformation: { type: "thinPlateSpline" } },
            LAOCOON.width,
            LAOCOON.height,
        );
        expect(warped.kind).toBe("skipped");
        if (warped.kind === "skipped") {
            expect(warped.reason).toContain("thinPlateSpline");
        }
    });

    it("skips rotated sheets and non-affine point sets", () => {
        // a sheet scanned at 45°: the placement cannot be an axis-aligned box
        const rotated = {
            type: "FeatureCollection",
            features: [
                { properties: { resourceCoords: [0, 0] }, geometry: { coordinates: [0, 0] } },
                { properties: { resourceCoords: [100, 0] }, geometry: { coordinates: [1, 1] } },
                { properties: { resourceCoords: [0, 100] }, geometry: { coordinates: [-1, 1] } },
            ],
        } as unknown as StorymapGeoreferenceBody;
        const fit = fitGeoreference(rotated, 100, 100);
        expect(fit.kind).toBe("skipped");
        if (fit.kind === "skipped") {
            expect(fit.reason).toContain("rotated or skewed");
        }

        // points that no single affine can pass through
        const scattered = {
            type: "FeatureCollection",
            features: [
                { properties: { resourceCoords: [0, 0] }, geometry: { coordinates: [0, 0] } },
                { properties: { resourceCoords: [100, 0] }, geometry: { coordinates: [1, 0] } },
                { properties: { resourceCoords: [0, 100] }, geometry: { coordinates: [0, 1] } },
                { properties: { resourceCoords: [100, 100] }, geometry: { coordinates: [5, 5] } },
            ],
        } as unknown as StorymapGeoreferenceBody;
        const bad = fitGeoreference(scattered, 100, 100);
        expect(bad.kind).toBe("skipped");
        if (bad.kind === "skipped") {
            expect(bad.reason).toContain("do not fit an affine transform");
        }
    });

    it("rejects images without usable dimensions", () => {
        const fit = fitGeoreference(placedSheet(), 0, 3000);
        expect(fit.kind).toBe("skipped");
    });

    it("resolves the info.json of an image service", () => {
        expect(resolveInfoJsonUrl("https://example.org/iiif/image1")).toBe(
            "https://example.org/iiif/image1/info.json",
        );
        expect(resolveInfoJsonUrl("https://example.org/iiif/image1/")).toBe(
            "https://example.org/iiif/image1/info.json",
        );
        expect(resolveInfoJsonUrl("https://example.org/iiif/image1/info.json")).toBe(
            "https://example.org/iiif/image1/info.json",
        );
    });
});
