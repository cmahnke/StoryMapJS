/**
 * Shared helpers for the IIIF round-trip pair (`iiif.ts` reads manifests,
 * `to-iiif.ts` writes them) and the Content State codec (`content-state.ts`).
 *
 * These were three verbatim copies (`LOCATION_PROPERTIES`, `asRecord`, the
 * `xywh` handling, the URL checks): adding a key to one side silently broke
 * the round trip. There is exactly one intentional non-unification here —
 * the `xywh` fragment parsers keep their own validation (the manifest reader
 * requires non-negative origins and positive sizes for an image region, the
 * Content State codec parses Media Fragment URIs permissively), so only the
 * guards below are shared, not the fragment regexes.
 */

/** Keys copied verbatim between navPlace Feature properties and the location. */
export const LOCATION_PROPERTIES = [
    "name",
    "zoom",
    "rotation",
    "basemap",
    "filter",
    "mask",
    "line",
    "icon",
    "iconSize",
    "image",
    "use_custom_marker",
    // marker presentation with no IIIF vocabulary of its own: a GeoJSON
    // foreign member needs no registration, which is why these live here
    // rather than in a storymap: term (a GeoJSON foreign member needs no registration)
    "popup",
    "audioBadge",
] as const;

/** A plain object, or null for anything else (arrays included). */
export function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return null;
    }
    return value as Record<string, unknown>;
}

/** A non-empty string, or null. */
export function asString(value: unknown): string | null {
    return typeof value === "string" && value !== "" ? value : null;
}

/** A real number (NaN rejected), or null. */
export function asNumber(value: unknown): number | null {
    return typeof value === "number" && !isNaN(value) ? value : null;
}

/** A boolean, or null. */
export function asBoolean(value: unknown): boolean | null {
    return typeof value === "boolean" ? value : null;
}

/** A string or list of strings as a string list (anything else: empty). */
export function asStringArray(value: unknown): string[] {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) {
        return value.filter((entry): entry is string => typeof entry === "string");
    }
    return [];
}

/** A `[west, south, east, north]` box of four finite numbers. */
export function isLonLatBox(value: unknown): value is [number, number, number, number] {
    return (
        Array.isArray(value) &&
        value.length === 4 &&
        value.every((n) => typeof n === "number" && Number.isFinite(n))
    );
}

/** True for absolute `http(s)` URLs. DOM-free, so the CLI converter can use it. */
export function isHttpUrl(value: unknown): value is string {
    return typeof value === "string" && /^https?:\/\//i.test(value);
}

/** A plain string as a language-neutral (`none`) language map. */
export function languageMap(value: string): { none: string[] } {
    return { none: [value] };
}

/**
 * Escape the five characters that would otherwise be markup. Shared by the
 * manifest reader (multi-paragraph bodies) and the slideshow translator
 * (single-paragraph bodies) — the wrappers differ, the escaping must not.
 */
export function escapeText(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * Playback flags shared by narration and audio/video media (slideshow
 * audio terms when they ride `storymap:` foreign members). All optional;
 * absent means the long-standing behavior (play on arrival, stop on leave).
 */
export interface PlaybackBag {
    loop?: boolean;
    offset?: number;
    play?: "auto" | "click";
    stopOnExit?: boolean;
    stopAllPrevious?: boolean;
}

/**
 * Read playback flags off a record's `storymap:` foreign members. Only
 * well-typed values are kept; `onUnknownPlay` reports an unexpected `play`
 * (the slideshow translator warns, the manifest reader stays silent).
 */
export function readPlaybackBag(
    record: Record<string, unknown> | null,
    onUnknownPlay?: (value: unknown) => void,
): PlaybackBag {
    const bag: PlaybackBag = {};
    if (!record) return bag;
    if (typeof record["storymap:loop"] === "boolean") bag.loop = record["storymap:loop"];
    const offset = record["storymap:offset"];
    if (typeof offset === "number" && Number.isFinite(offset) && offset >= 0) {
        bag.offset = offset;
    }
    const play = record["storymap:play"];
    if (play === "auto" || play === "click") {
        bag.play = play;
    } else if (play !== undefined) {
        onUnknownPlay?.(play);
    }
    if (typeof record["storymap:stopOnExit"] === "boolean") {
        bag.stopOnExit = record["storymap:stopOnExit"];
    }
    if (typeof record["storymap:stopAllPrevious"] === "boolean") {
        bag.stopAllPrevious = record["storymap:stopAllPrevious"];
    }
    return bag;
}

/**
 * Write playback flags as `storymap:` foreign members. Only present flags
 * are written, so readers that never heard of them see an unchanged
 * annotation.
 */
export function writePlaybackTerms(bag: {
    loop?: boolean;
    offset?: number;
    play?: "auto" | "click";
    stopOnExit?: boolean;
    stopAllPrevious?: boolean;
}): {
    "storymap:loop"?: boolean;
    "storymap:offset"?: number;
    "storymap:play"?: string;
    "storymap:stopOnExit"?: boolean;
    "storymap:stopAllPrevious"?: boolean;
} {
    const terms: {
        "storymap:loop"?: boolean;
        "storymap:offset"?: number;
        "storymap:play"?: string;
        "storymap:stopOnExit"?: boolean;
        "storymap:stopAllPrevious"?: boolean;
    } = {};
    if (typeof bag.loop === "boolean") terms["storymap:loop"] = bag.loop;
    if (typeof bag.offset === "number") terms["storymap:offset"] = bag.offset;
    if (bag.play === "auto" || bag.play === "click") terms["storymap:play"] = bag.play;
    if (typeof bag.stopOnExit === "boolean") terms["storymap:stopOnExit"] = bag.stopOnExit;
    if (typeof bag.stopAllPrevious === "boolean") {
        terms["storymap:stopAllPrevious"] = bag.stopAllPrevious;
    }
    return terms;
}

/**
 * True when a narration URL duplicates slide media (the track is kept
 * once, as media, never twice).
 */
export function isDuplicateNarration(
    mediaUrls: (string | null | undefined)[],
    url: string,
): boolean {
    return mediaUrls.some((mediaUrl) => typeof mediaUrl === "string" && mediaUrl === url);
}

/**
 * Clamp an image region `[x, y, w, h]` to the canvas `[0, 0, W, H]`
 * (slideshow targets routinely overshoot, e.g. `#-922,1005,2129,949`).
 * Returns the intersected region, or null when nothing visible remains.
 * Without known dims only the negative origin is pulled to 0 (preserving
 * the far edge); zero/negative sizes are always null.
 */
export function clampRegion(
    region: [number, number, number, number],
    width: number | null,
    height: number | null,
): [number, number, number, number] | null {
    let [x, y, w, h] = region;
    if (![x, y, w, h].every((n) => typeof n === "number" && Number.isFinite(n))) {
        return null;
    }
    if (!(w > 0) || !(h > 0)) return null;
    if (x < 0) {
        w += x;
        x = 0;
    }
    if (y < 0) {
        h += y;
        y = 0;
    }
    if (width !== null && width > 0) {
        w = Math.min(w, width - x);
    }
    if (height !== null && height > 0) {
        h = Math.min(h, height - y);
    }
    if (!(w > 0) || !(h > 0)) return null;
    return [x, y, w, h];
}

/** A finite number within `[min, max]`, or null. */
export function asClampedNumber(value: unknown, min: number, max: number): number | null {
    if (typeof value !== "number" || isNaN(value) || !Number.isFinite(value)) return null;
    return Math.min(max, Math.max(min, value));
}
