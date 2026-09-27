// Affine placement of IIIF images from Georeference Extension ground control
// points, as a pure module so it can be unit tested without OpenLayers or a
// network.
//
// The IIIF Georeference Extension (iiif.io/api/extension/georef) supplies a
// GeoJSON FeatureCollection pairing `properties.resourceCoords` (image
// pixels) with `geometry.coordinates` (WGS84 lon/lat). Fitting those points
// yields the placement of the image on the geographic map.
//
// Only what OpenLayers can actually render is supported: the affine
// (first-order polynomial) case with an axis-aligned result, which is placed
// as a geographic `extent` on the IIIF source and reprojected by the view.
// Rotated or skewed sheets, higher-order polynomials and thin plate splines
// are reported so the caller can warn and skip them instead of drawing a
// wrong layer.

import type { StorymapGeoreferenceBody } from "../types";

/** An affine transform: x' = a·x + c·y + e, y' = b·x + d·y + f */
export type AffineTransform = [number, number, number, number, number, number];

/** Bounding box in WGS84 degrees, `[west, south, east, north]` */
export type LonLatBbox = [number, number, number, number];

/** Ground control point pairing an image pixel with a WGS84 position */
export interface GroundControlPoint {
    /** Image pixel `[x, y]` */
    pixel: [number, number];
    /** WGS84 `[lon, lat]` */
    lonLat: [number, number];
}

/**
 * Largest allowed deviation, in degrees, between a control point and its
 * affine prediction. GCP sets digitized by hand routinely miss by a few
 * hundred metres; anything beyond this is a projection problem (or a
 * higher-order transform) that an affine cannot represent.
 */
const MAX_RESIDUAL_DEGREES = 0.05;

/**
 * Largest allowed sine of the rotation/skew between the image axes and the
 * geographic axes. The placement is drawn as an axis-aligned geographic
 * extent, so a sheet scanned at an angle cannot be represented.
 */
const MAX_AXIS_SKEW = 0.01;

export type GeoreferenceFit =
    | {
          kind: "placed";
          /** image pixel → WGS84 lon/lat */
          transform: AffineTransform;
          /** bounding box of the four image corners, in WGS84 degrees */
          bbox: LonLatBbox;
          /** mean absolute residual of the fit, in degrees */
          residual: number;
      }
    | {
          kind: "skipped";
          /** why the points cannot be placed, for the console warning */
          reason: string;
      };

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && isFinite(value);
}

/**
 * Resolves the `info.json` of a IIIF Image API service. The georeference
 * term may name either the service base (as the Georeference Extension's
 * ImageService target does) or the `info.json` document itself (as the
 * `iiif.url` option does), so both are accepted.
 */
export function resolveInfoJsonUrl(url: string): string {
    const trimmed = url.replace(/\/+$/, "");
    return /info\.json$/.test(trimmed) ? trimmed : trimmed + "/info.json";
}

/**
 * Reads the ground control points out of a Georeference annotation body.
 * Returns null when the body is malformed or holds fewer than three points
 * (two points do not determine a transform).
 */
export function readGroundControlPoints(body: unknown): GroundControlPoint[] | null {
    if (typeof body !== "object" || body === null) {
        return null;
    }
    const features = (body as { features?: unknown }).features;
    if (!Array.isArray(features)) {
        return null;
    }
    const points: GroundControlPoint[] = [];
    for (const feature of features) {
        if (typeof feature !== "object" || feature === null) {
            continue;
        }
        const record = feature as {
            properties?: { resourceCoords?: unknown };
            geometry?: { coordinates?: unknown };
        };
        const coords = record.properties?.resourceCoords;
        const position = record.geometry?.coordinates;
        if (!Array.isArray(coords) || !Array.isArray(position)) {
            continue;
        }
        if (!isFiniteNumber(coords[0]) || !isFiniteNumber(coords[1])) {
            continue;
        }
        if (!isFiniteNumber(position[0]) || !isFiniteNumber(position[1])) {
            continue;
        }
        points.push({
            pixel: [coords[0], coords[1]],
            lonLat: [position[0], position[1]],
        });
    }
    return points.length >= 3 ? points : null;
}

/**
 * Whether the annotation's `transformation` hint asks for something the
 * viewer cannot place. Absent or `polynomial` order 1 is fine; a missing
 * order defaults to 1 in the Georeference Extension.
 */
export function unsupportedTransformation(body: StorymapGeoreferenceBody): string | null {
    const transformation = body?.transformation;
    if (!transformation || typeof transformation !== "object") {
        return null;
    }
    const type = transformation.type;
    if (type === undefined || type === null) {
        return null;
    }
    if (type !== "polynomial") {
        return `transformation type "${type}" is not supported (only a first-order polynomial is placed affinely)`;
    }
    const order = transformation.options?.order;
    if (order !== undefined && order !== 1) {
        return `polynomial order ${order} is not supported (only first-order is placed affinely)`;
    }
    return null;
}

/**
 * Least-squares fit of the affine transform mapping image pixels to WGS84
 * lon/lat. Solves the two independent 3-parameter systems (x for lon, y for
 * lat) with Gaussian elimination and partial pivoting; with three or more
 * points the fit is over-determined, which absorbs the small errors of
 * hand-digitized control points.
 */
export function fitAffine(points: GroundControlPoint[]): AffineTransform | null {
    if (points.length < 3) {
        return null;
    }
    // The two systems share the same 3×3 normal matrix
    const normal = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];
    const rhsX = [0, 0, 0];
    const rhsY = [0, 0, 0];
    for (const point of points) {
        const [x, y] = point.pixel;
        const row = [x, y, 1];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                normal[i][j] += row[i] * row[j];
            }
            rhsX[i] += row[i] * point.lonLat[0];
            rhsY[i] += row[i] * point.lonLat[1];
        }
    }
    const lon = solve3x3(normal, rhsX);
    const lat = solve3x3(normal, rhsY);
    if (!lon || !lat) {
        return null;
    }
    // [a, b, c, d, e, f] with lon' = a·x + c·y + e, lat' = b·x + d·y + f
    return [lon[0], lat[0], lon[1], lat[1], lon[2], lat[2]];
}

/** Applies a fitted transform to an image pixel. */
export function applyAffine(transform: AffineTransform, x: number, y: number): [number, number] {
    const [a, b, c, d, e, f] = transform;
    return [a * x + c * y + e, b * x + d * y + f];
}

/**
 * Fits a Georeference annotation body and reports whether the result can be
 * drawn as an axis-aligned geographic extent.
 */
export function fitGeoreference(
    body: StorymapGeoreferenceBody,
    width: number,
    height: number,
): GeoreferenceFit {
    if (!isFiniteNumber(width) || !isFiniteNumber(height) || width <= 0 || height <= 0) {
        return {
            kind: "skipped",
            reason: "the placed image has no usable pixel dimensions",
        };
    }
    const unsupported = unsupportedTransformation(body);
    if (unsupported) {
        return { kind: "skipped", reason: unsupported };
    }
    const points = readGroundControlPoints(body);
    if (!points) {
        return {
            kind: "skipped",
            reason: "the georeference has fewer than three valid ground control points",
        };
    }
    const transform = fitAffine(points);
    if (!transform) {
        return {
            kind: "skipped",
            reason: "the ground control points do not determine a transform",
        };
    }

    // How far the fit strays from the digitized points
    let total = 0;
    for (const point of points) {
        const [lon, lat] = applyAffine(transform, point.pixel[0], point.pixel[1]);
        total += Math.abs(lon - point.lonLat[0]) + Math.abs(lat - point.lonLat[1]);
    }
    const residual = total / (points.length * 2);
    if (residual > MAX_RESIDUAL_DEGREES) {
        return {
            kind: "skipped",
            reason:
                "the ground control points do not fit an affine transform " +
                `(mean residual ${residual.toFixed(4)}°, limit ${MAX_RESIDUAL_DEGREES}°); ` +
                "the sheet needs a projection or a warped layer",
        };
    }

    // The image is drawn as an axis-aligned extent, so the axes must line up
    // with the geographic axes
    const [a, b, c, d] = transform;
    const lonLength = Math.hypot(a, b);
    const latLength = Math.hypot(c, d);
    const skew = Math.max(
        lonLength > 0 ? Math.abs(b) / lonLength : 1,
        latLength > 0 ? Math.abs(c) / latLength : 1,
    );
    if (skew > MAX_AXIS_SKEW) {
        return {
            kind: "skipped",
            reason:
                "the placed image is rotated or skewed relative to the geographic axes; " +
                "the viewer places axis-aligned sheets only (use tile_source_factory for warped layers)",
        };
    }

    // Bounding box of the four image corners
    const corners: [number, number][] = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
    ];
    let west = Infinity;
    let south = Infinity;
    let east = -Infinity;
    let north = -Infinity;
    for (const [x, y] of corners) {
        const [lon, lat] = applyAffine(transform, x, y);
        west = Math.min(west, lon);
        east = Math.max(east, lon);
        south = Math.min(south, lat);
        north = Math.max(north, lat);
    }
    if (
        !isFiniteNumber(west) ||
        !isFiniteNumber(south) ||
        !isFiniteNumber(east) ||
        !isFiniteNumber(north) ||
        east <= west ||
        north <= south
    ) {
        return {
            kind: "skipped",
            reason: "the placed image has a degenerate extent",
        };
    }
    return { kind: "placed", transform, bbox: [west, south, east, north], residual };
}

/** Solves a 3×3 linear system by Gaussian elimination with partial pivoting. */
function solve3x3(matrix: number[][], rhs: number[]): [number, number, number] | null {
    const m = [
        [matrix[0][0], matrix[0][1], matrix[0][2], rhs[0]],
        [matrix[1][0], matrix[1][1], matrix[1][2], rhs[1]],
        [matrix[2][0], matrix[2][1], matrix[2][2], rhs[2]],
    ];
    for (let column = 0; column < 3; column++) {
        let pivot = column;
        for (let row = column + 1; row < 3; row++) {
            if (Math.abs(m[row][column]) > Math.abs(m[pivot][column])) {
                pivot = row;
            }
        }
        if (Math.abs(m[pivot][column]) < 1e-12) {
            return null;
        }
        if (pivot !== column) {
            const swap = m[pivot];
            m[pivot] = m[column];
            m[column] = swap;
        }
        for (let row = 0; row < 3; row++) {
            if (row === column) {
                continue;
            }
            const factor = m[row][column] / m[column][column];
            for (let k = column; k < 4; k++) {
                m[row][k] -= factor * m[column][k];
            }
        }
    }
    return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
}
