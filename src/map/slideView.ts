/**
 * Pure view helpers for slideshow-driven slide presentation: rotation,
 * CSS filter grading, spotlight masks and per-slide basemaps.
 *
 * DOM- and OpenLayers-free so the CLI and unit tests can use them; the map
 * engine (`Map.OpenLayers`) applies their output. Every helper treats
 * absent/mistyped input as "feature off", so stories that never mention the
 * new fields render exactly as before.
 */

import type { StorymapSlideFilter, StorymapSlideLocation, StorymapSlideMask } from "../types";
import { asClampedNumber } from "../storymap/iiif-shared.ts";

/**
 * Valid ranges for filter grading, shared by the translator (which reads
 * them) and the renderer (which enforces them again — hand-written JSON
 * reaches the renderer directly, so read-time clamping alone is not enough).
 */
export const FILTER_RANGES = {
    brightness: { min: 0, max: 200, def: 100 },
    contrast: { min: 0, max: 200, def: 100 },
    saturate: { min: 0, max: 200, def: 100 },
    hueRotate: { min: -180, max: 180, def: 0 },
    sepia: { min: 0, max: 100, def: 0 },
    blur: { min: 0, max: 20, def: 0 },
} as const;

/** View rotation in radians, or null when the slide states none. */
export function slideRotationRad(
    location: StorymapSlideLocation | null | undefined,
): number | null {
    const rotation = location?.rotation;
    if (typeof rotation !== "number" || !Number.isFinite(rotation) || rotation === 0) {
        return null;
    }
    return (rotation * Math.PI) / 180;
}

/**
 * A `filter()` CSS value for the map viewport from a slide `filter` bag
 * (slideshow `filters`): brightness/contrast/saturate in percent,
 * hue-rotate in degrees, sepia in percent, blur in pixels. Unknown keys
 * never reach CSS. Returns "" when nothing is graded.
 */
export function buildSlideFilter(filter: StorymapSlideFilter | null | undefined): string {
    if (!filter || typeof filter !== "object") return "";
    const parts: string[] = [];
    const percent = (value: unknown, name: "brightness" | "contrast" | "saturate" | "sepia") => {
        if (typeof value !== "number" || !Number.isFinite(value)) return;
        const { min, max, def } = FILTER_RANGES[name];
        if (value === def) return;
        parts.push(`${name}(${asClampedNumber(value, min, max)}%)`);
    };
    percent(filter.brightness, "brightness");
    percent(filter.contrast, "contrast");
    percent(filter.saturate, "saturate");
    const hue = asClampedNumber(filter.hueRotate, ...filterRange("hueRotate"));
    if (hue !== null && hue !== FILTER_RANGES.hueRotate.def) {
        parts.push(`hue-rotate(${hue}deg)`);
    }
    percent(filter.sepia, "sepia");
    const blur = asClampedNumber(filter.blur, ...filterRange("blur"));
    if (blur !== null && blur !== FILTER_RANGES.blur.def) {
        parts.push(`blur(${blur}px)`);
    }
    return parts.join(" ");
}

/** The `[min, max]` pair for a filter range (spread into `asClampedNumber`). */
function filterRange(key: keyof typeof FILTER_RANGES): [number, number] {
    return [FILTER_RANGES[key].min, FILTER_RANGES[key].max];
}

const MASK_COLOR = /^(#[0-9a-f]{3}([0-9a-f]{3}([0-9a-f]{2})?)?|rgba?\([^)]*\))$/i;

export interface NormalizedMask {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    invert: boolean;
    opacity: number;
}

/**
 * A validated spotlight mask (slideshow `passepartout`): normalized
 * viewport fractions plus presentation. Returns null for anything that is
 * not a usable `{x, y, w, h}` shape; out-of-range fractions are clamped,
 * an unparsable color falls back to translucent black.
 */
export function normalizeMask(mask: StorymapSlideMask | null | undefined): NormalizedMask | null {
    if (!mask || typeof mask !== "object") return null;
    const { x, y, w, h } = mask;
    if (
        typeof x !== "number" ||
        typeof y !== "number" ||
        typeof w !== "number" ||
        typeof h !== "number" ||
        ![x, y, w, h].every(Number.isFinite)
    ) {
        return null;
    }
    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    const nx = clamp01(x);
    const ny = clamp01(y);
    // shrink the far edge with a clamped origin (like clampRegion): a mask
    // fully outside the viewport resolves to nothing, not a full mask
    const nw = Math.min(1 - nx, Math.max(0, w + Math.min(0, x)));
    const nh = Math.min(1 - ny, Math.max(0, h + Math.min(0, y)));
    if (!(nw > 0) || !(nh > 0)) return null;
    const rawColor = typeof mask.color === "string" ? mask.color.trim() : "";
    const color = rawColor !== "" && MASK_COLOR.test(rawColor) ? rawColor : "rgba(0,0,0,0.5)";
    const opacity =
        typeof mask.opacity === "number" && Number.isFinite(mask.opacity)
            ? Math.min(1, Math.max(0, mask.opacity))
            : 1;
    return { x: nx, y: ny, w: nw, h: nh, color, invert: mask.invert === true, opacity };
}

/** The per-slide basemap key, or null when the slide keeps the story basemap. */
export function slideBasemapKey(location: StorymapSlideLocation | null | undefined): string | null {
    const basemap = location?.basemap;
    return typeof basemap === "string" && basemap !== "" ? basemap : null;
}

/**
 * True for plain image-file URLs (no IIIF service, `{z}` template or
 * keyword). Only unambiguous raster extensions: `.jpx`/`.jp2` can be IIIF
 * bases too (Leipzig serves `info.json` off `.jpx`), so those go through
 * the service attempt with a static fallback instead. Relative URLs
 * (same-origin static files) count; templates never match (no extension).
 */
export function isStaticImageUrl(url: string): boolean {
    if (url.includes("{z}")) return false;
    if (!/\.(jpe?g|png|gif|webp|tif?f|bmp|avif)(\?.*)?$/i.test(url)) return false;
    if (/^https?:\/\//i.test(url)) return true;
    // same-origin relative file without any other scheme (mapbox:, osm:, …)
    return !/^[a-z][a-z0-9+.-]*:/i.test(url);
}

/**
 * An image service base as its `info.json` URL (idempotent for URLs that
 * already name it). Shared by the slideshow translator (story default) and
 * the per-slide basemap builder so the suffix rule cannot drift.
 */
export function serviceToInfoJson(service: string): string {
    return /info\.json$/i.test(service) ? service : `${service.replace(/\/$/, "")}/info.json`;
}
