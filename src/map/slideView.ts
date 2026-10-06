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
    const percent = (value: unknown, name: string, min: number, max: number, def: number) => {
        if (typeof value !== "number" || !Number.isFinite(value) || value === def) return;
        const clamped = Math.min(max, Math.max(min, value));
        parts.push(`${name}(${clamped}%)`);
    };
    percent(filter.brightness, "brightness", 0, 200, 100);
    percent(filter.contrast, "contrast", 0, 200, 100);
    percent(filter.saturate, "saturate", 0, 200, 100);
    if (
        typeof filter.hueRotate === "number" &&
        Number.isFinite(filter.hueRotate) &&
        filter.hueRotate !== 0
    ) {
        const clamped = Math.min(180, Math.max(-180, filter.hueRotate));
        parts.push(`hue-rotate(${clamped}deg)`);
    }
    percent(filter.sepia, "sepia", 0, 100, 0);
    if (typeof filter.blur === "number" && Number.isFinite(filter.blur) && filter.blur !== 0) {
        const clamped = Math.min(20, Math.max(0, filter.blur));
        parts.push(`blur(${clamped}px)`);
    }
    return parts.join(" ");
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
    const nw = Math.min(1 - nx, Math.max(0, w));
    const nh = Math.min(1 - ny, Math.max(0, h));
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
