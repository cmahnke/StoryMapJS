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
