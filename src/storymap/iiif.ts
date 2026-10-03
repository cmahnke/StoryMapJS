// Conversion of IIIF Presentation API 3.0 manifests into legacy StoryMapJS
// data, following the mapping proposed in docs/storymap-as-iiif-manifest.md.
//
// The converter is intentionally defensive: every property is read through
// narrowing helpers and malformed shapes are skipped, never thrown.

import type {
    StorymapData,
    StorymapGeoreference,
    StorymapTilejson,
    StorymapOverlayLayer,
    StorymapSlide,
    StorymapSlideBackground,
    StorymapSlideLocation,
    StorymapSlideMedia,
} from "../types";
import { readGroundControlPoints } from "../map/georeference";
import {
    LOCATION_PROPERTIES,
    asBoolean,
    asNumber,
    asRecord,
    asString,
    asStringArray,
    isLonLatBox,
} from "./iiif-shared";

const PRESENTATION_3_CONTEXT = "iiif.io/api/presentation/3/context.json";
const MAPCONFIG_PROFILE = "mapconfig";
const STORYMAP_PREFIX = "storymap:";

/**
 * Reads a IIIF xywh image region (`storymap:imageRegion`): an array of
 * exactly 4 finite numbers ([x, y, w, h] in image pixels). Returns null
 * for anything else — invalid regions are ignored.
 */
/**
 * A language map reduced to one string in the language the viewer is using,
 * together with the language that was actually chosen (§3.4).
 *
 * `flattenLanguageMap` used to concatenate *every* language, which loses which
 * language each string was in — for a bilingual tour that produced a headline
 * of "Hallo Hello" and no way to tell a host what the viewer had picked. The
 * choice is: the configured language, then its base subtag (`de-AT` → `de`),
 * then the language-neutral `none`, then the first key present.
 *
 * `language` is null for `none`, which is genuinely language-neutral and not a
 * language a host could offer in a switch.
 */
export function pickLanguageMap(
    value: unknown,
    preferred: string | null = null,
): { value: string; language: string | null } {
    if (typeof value === "string") return { value, language: null };
    const record = asRecord(value);
    if (!record) return { value: "", language: null };
    // a TextualBody carries its text in `value`; that is a single string, not
    // a language map, so it keeps flattenLanguageMap's shape
    const textual = record.value;
    if (typeof textual === "string") return { value: textual, language: null };
    if (Array.isArray(textual)) {
        return { value: asStringArray(textual).join(" ").trim(), language: null };
    }

    const keys = Object.keys(record);
    if (keys.length === 0) return { value: "", language: null };
    const join = (key: string): string => asStringArray(record[key]).join(" ").trim();

    if (preferred !== null && preferred !== "") {
        for (const key of keys) {
            if (key.toLowerCase() === preferred.toLowerCase()) {
                return { value: join(key), language: key };
            }
        }
        const base = preferred.split("-")[0].toLowerCase();
        for (const key of keys) {
            if (key.toLowerCase() === base) return { value: join(key), language: key };
        }
    }
    if ("none" in record) return { value: join("none"), language: null };
    return { value: join(keys[0]), language: keys[0] };
}

/**
 * A selector, normalized. Every field is optional and the object is a
 * *superset* carrier: an annotation may carry a region, a point, a quote and a
 * time range at once, and we keep what we understand instead of stopping at
 * the first hit.
 *
 * - `region`: xywh image pixels. From an Image API Selector / FragmentSelector
 *   (`xywh=`), or synthesized from a `point` when the canvas size is known.
 * - `point`: x/y image pixels, from a `PointSelector`.
 * - `quote`: a `TextQuoteSelector`. Preserved, **not resolved** — a canvas
 *   carries no transcript, so matching the quoted text needs one the tour
 *   supplies. See docs/iiif-authoring.md.
 * - `time`: start/end in seconds, from a `TimeState` or `start`/`end` on a
 *   SpecificResource, for time-anchored stops and narration.
 * - `svg`: an `SvgSelector`'s shape markup. Preserved for round-tripping; the
 *   viewer fits `region`, so a non-rectangular selection is not highlighted
 *   with its true outline yet.
 */
export interface ReadSelector {
    region: [number, number, number, number] | null;
    point: { x: number; y: number } | null;
    quote: { exact: string; prefix?: string; suffix?: string } | null;
    time: { start?: number; end?: number } | null;
    svg: string | null;
}

const EMPTY_SELECTOR: ReadSelector = {
    region: null,
    point: null,
    quote: null,
    time: null,
    svg: null,
};

function isEmptySelector(sel: ReadSelector): boolean {
    return (
        sel.region === null &&
        sel.point === null &&
        sel.quote === null &&
        sel.time === null &&
        sel.svg === null
    );
}

/** A `PointSelector` is a pin, which the viewer cannot fit, so we synthesize
 *  a square of 5% of the canvas's smaller side, centred on the point and
 *  clamped to the canvas. Stated once, here: the annotation-driven stops in
 *  docs/plans/iiif-media-tours.md consume this rather than re-deriving it. */
const POINT_SQUARE_FRACTION = 0.05;

function pointToRegion(
    point: { x: number; y: number },
    width: number | null,
    height: number | null,
): [number, number, number, number] | null {
    if (width === null || height === null) return null;
    if (!(width > 0) || !(height > 0)) return null;
    const side = Math.max(1, Math.round(Math.min(width, height) * POINT_SQUARE_FRACTION));
    const x = Math.max(0, Math.min(width - side, Math.round(point.x - side / 2)));
    const y = Math.max(0, Math.min(height - side, Math.round(point.y - side / 2)));
    return [x, y, side, side];
}

/** One selector entry, plus one level of `refinedBy`. */
function readSelectorEntry(entry: unknown, out: ReadSelector, depth = 0): void {
    const selector = asRecord(entry);
    if (!selector) return;
    const type = asString(selector.type);

    if (type === "ImageApiSelector" || type === "FragmentSelector") {
        const raw = asString(selector.value);
        if (raw !== null && out.region === null) {
            const match = /xywh=(pixel:)?([^,]+),([^,]+),([^,]+),([^,]+)/.exec(raw);
            if (match) {
                const parts = match.slice(2).map(Number);
                if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
                    if (parts[0] >= 0 && parts[1] >= 0 && parts[2] > 0 && parts[3] > 0) {
                        out.region = parts as [number, number, number, number];
                    }
                }
            }
        }
    } else if (type === "PointSelector") {
        const x = asNumber(selector.x);
        const y = asNumber(selector.y);
        if (x !== null && y !== null && out.point === null) {
            out.point = { x, y };
        }
    } else if (type === "TextQuoteSelector") {
        const exact = asString(selector.exact);
        if (exact !== null && out.quote === null) {
            const prefix = asString(selector.prefix);
            const suffix = asString(selector.suffix);
            out.quote = {
                exact,
                ...(prefix !== null ? { prefix } : {}),
                ...(suffix !== null ? { suffix } : {}),
            };
        }
    } else if (type === "SvgSelector") {
        const value = asString(selector.value);
        if (value !== null && out.svg === null) out.svg = value;
    } else if (type === "TimeState" || type === "oa:TimeState") {
        const state = asRecord(selector);
        const start = asNumber(state?.start);
        const end = asNumber(state?.end);
        if ((start !== null || end !== null) && out.time === null) {
            out.time = { ...(start !== null ? { start } : {}), ...(end !== null ? { end } : {}) };
        }
    }

    if (depth < 1) {
        const refined = Array.isArray(selector.refinedBy)
            ? selector.refinedBy
            : [selector.refinedBy];
        for (const nested of refined) readSelectorEntry(nested, out, depth + 1);
    }
}

/**
 * Reads a Web Annotation target (a string fragment, a SpecificResource, or
 * either carrying `selector`/`state` arrays) into a normalized
 * {@link ReadSelector}. `width`/`height` are the canvas size in pixels, used
 * only to synthesize a region from a point selector; pass null when unknown.
 */
export function readSelector(
    target: unknown,
    width: number | null = null,
    height: number | null = null,
): ReadSelector {
    const out: ReadSelector = { ...EMPTY_SELECTOR };

    // A bare string target may carry the fragment: "…/canvas/2#xywh=10,20,30,40"
    const asText = asString(target);
    if (asText !== null) {
        readSelectorEntry({ type: "FragmentSelector", value: asText }, out);
    }

    const record = asRecord(target);
    if (record) {
        const selectors = Array.isArray(record.selector) ? record.selector : [record.selector];
        for (const entry of selectors) readSelectorEntry(entry, out);
        const states = Array.isArray(record.state) ? record.state : [record.state];
        for (const entry of states) readSelectorEntry(entry, out);
    }

    // A SpecificResource may carry the time range directly.
    if (record && out.time === null) {
        const start = asNumber(record.start);
        const end = asNumber(record.end);
        if (start !== null || end !== null) {
            out.time = {
                ...(start !== null ? { start } : {}),
                ...(end !== null ? { end } : {}),
            };
        }
    }

    if (out.region === null && out.point !== null) {
        out.region = pointToRegion(out.point, width, height);
    }

    return isEmptySelector(out) ? { ...EMPTY_SELECTOR } : out;
}

/**
 * Flattens a IIIF language map (`{"none": ["text"]}`, `{"en": ["Hello"]}`) to a
 * plain string. The `none` language is preferred; entries are joined with a
 * space. Also accepts a plain string and a TextualBody (`{value: "..."}`),
 * which the proposal allows for Canvas summaries.
 */
export function flattenLanguageMap(value: unknown): string {
    if (typeof value === "string") return value;
    const record = asRecord(value);
    if (!record) return "";
    const textual = record.value;
    if (typeof textual === "string") return textual;
    if (Array.isArray(textual)) {
        return asStringArray(textual).join(" ").trim();
    }
    // Language map: prefer the "none" key, fall back to every language in order.
    const keys = "none" in record ? ["none"] : Object.keys(record);
    const parts: string[] = [];
    for (const key of keys) {
        parts.push(...asStringArray(record[key]));
    }
    return parts.join(" ").trim();
}

/**
 * A `requiredStatement` reduced to its label and value.
 *
 * In Presentation 3 `requiredStatement` is a **single `{label, value}`
 * object** — the official IIIF validator rejects the array form with "is not of
 * type 'object'" — so the array branch below is producer leniency, not
 * conformance. The `label` ("Credit", "Rights holder", a language-tagged term)
 * is half of what a real institutional manifest ships, and reading only
 * `.value` dropped it. See docs/plans/iiif-interop.md §2.1.
 */
function readRequiredStatement(statement: unknown): { label: string; value: string } {
    const entries = Array.isArray(statement)
        ? statement
        : statement !== undefined
          ? [statement]
          : [];
    for (const entry of entries) {
        const record = asRecord(entry);
        if (!record) continue;
        const value = flattenLanguageMap(record.value);
        if (value === "") continue;
        return { label: flattenLanguageMap(record.label), value };
    }
    return { label: "", value: "" };
}

/**
 * Attribution text for a `requiredStatement`, keeping its label.
 *
 * A labelled statement reads as "Label: value", because that is how the value
 * was meant to be attributed. An unlabelled one is returned verbatim, exactly
 * as before — plenty of manifests state a bare rights line and prefixing it
 * would be noise.
 */
function formatAttribution(statement: { label: string; value: string }): string {
    if (statement.value === "") return "";
    if (statement.label === "") return statement.value;
    return `${statement.label}: ${statement.value}`;
}

/**
 * Reads a StoryMap extension term from a Canvas or service object. Manifests
 * use the `storymap:`-prefixed form, but JSON-LD processors may emit the bare
 * term, so both are accepted. The bare `type` key is never read because it
 * collides with the IIIF resource type (`"Canvas"`).
 */
function readTerm(record: Record<string, unknown>, term: string): unknown {
    const prefixed = record[STORYMAP_PREFIX + term];
    if (prefixed !== undefined) {
        return prefixed;
    }
    return term === "type" ? undefined : record[term];
}

/**
 * True when `data` looks like a Presentation API 3.0 **Manifest**.
 *
 * A `Collection` is explicitly *not* one, even though it carries the same
 * `@context`. Detection used to accept anything with the P3 context, so a
 * Collection passed and its member Manifests were fed to `canvasToSlide` as if
 * they were Canvases — every member became a text-only slide, with no media, no
 * locations and no warning. `within`-style Collections are now handled by the
 * private `collectionToStorymapData` below, and anything else is rejected here.
 */
export function isPresentation3Manifest(data: unknown): boolean {
    const record = asRecord(data);
    if (!record) return false;
    if (record.type === "Collection") return false;
    if (record.type === "Manifest") return true;
    const context = record["@context"];
    const candidates = Array.isArray(context) ? context : [context];
    return candidates.some(
        (entry) => typeof entry === "string" && entry.includes(PRESENTATION_3_CONTEXT),
    );
}

/** True when `data` is a Presentation API 3.0 Collection. */
export function isPresentation3Collection(data: unknown): boolean {
    const record = asRecord(data);
    return record !== null && record.type === "Collection";
}

/**
 * A Collection: reported and rejected, with nothing silently mangled.
 *
 * §2.2 offered two branches — flatten the member Manifests, or reject with an
 * explicit error. Neither survives contact with the specification, and the
 * choice is worth recording:
 *
 * - **Flattening is impossible here.** A Presentation 3 `Collection`'s
 *   `items` are `id` **references** to manifests in other documents, so
 *   flattening means fetching them, and this converter is synchronous and does
 *   no I/O.
 * - **A Collection fixture could not be authored either.** The official IIIF
 *   validator rejects both shapes of member the obvious forms suggest: an
 *   embedded `Manifest` object ("not valid under any of the given schemas") and
 *   a bare id string (the same). So no `public/examples-iiif/` fixture can
 *   exercise this path, and shipping one that fails `npm run validate:iiif` is
 *   not an option.
 *
 * So the honest outcome is the one that removes a defect and promises no
 * feature: previously a Collection was *accepted* and its members were fed to
 * `canvasToSlide` as if they were Canvases, producing text-only slides with no
 * media, no locations and no warning. Now it is named and skipped.
 *
 * A host that wants a multi-manifest tour composes it: fetch the members, call
 * {@link manifestToStorymapData} on each, and concatenate the `slides`. That
 * keeps the "no I/O on the load path" property §5.2's `seeAlso` reader is being
 * held back for.
 */
function collectionToStorymapData(collection: Record<string, unknown>): StorymapData {
    const data: StorymapData = { slides: [] };
    const title = flattenLanguageMap(collection.label);
    if (title !== "") data.title = title;

    const required = formatAttribution(readRequiredStatement(collection.requiredStatement));
    if (required !== "") {
        const iiif = (data.iiif as { url?: string; attribution?: string } | undefined) ?? {};
        iiif.attribution = required;
        if (iiif.url === undefined) iiif.url = "";
        data.iiif = iiif;
    }

    const members = Array.isArray(collection.items) ? collection.items : [];
    const memberIds = members
        .map((member) => (typeof member === "string" ? member : asString(asRecord(member)?.id)))
        .filter((id): id is string => typeof id === "string");
    console.warn(
        "StoryMapJS: this is a IIIF Collection with " +
            `${memberIds.length} member manifest(s) [${memberIds.join(", ")}]. ` +
            "A Presentation 3 Collection references its members from other documents, and " +
            "the converter is synchronous, so it contributes no slides rather than " +
            "mangling them. To build a multi-manifest tour, fetch the members and " +
            "concatenate their manifestToStorymapData() slides yourself " +
            "(see docs/plans/iiif-interop.md §2.2).",
    );

    return data;
}

/**
 * Finds the manifest-level map configuration service (profile containing
 * "mapconfig") and returns its properties, or null when absent.
 */
/**
 * The `info.json` URL of the image basemap, taken from the `ImageService3` a
 * painting body carries (§2.4).
 *
 * `service[0].id` is the service base, so the description is that plus
 * `/info.json`. A producer that put the description URL in `body.id` instead
 * is handled by the fallback. `map_type: "iiif"` means every canvas paints the
 * same basemap image, so the first one carrying a service is the basemap.
 */
function readImageServiceUrl(manifest: Record<string, unknown>): string | null {
    const canvases = Array.isArray(manifest.items) ? manifest.items : [];
    for (const canvas of canvases) {
        const record = asRecord(canvas);
        if (!record) continue;
        const pages = Array.isArray(record.items) ? record.items : [];
        for (const page of pages) {
            const pageRecord = asRecord(page);
            if (!pageRecord) continue;
            const annotations = Array.isArray(pageRecord.items) ? pageRecord.items : [];
            for (const annotation of annotations) {
                const annotationRecord = asRecord(annotation);
                if (!annotationRecord) continue;
                const bodies = Array.isArray(annotationRecord.body)
                    ? annotationRecord.body
                    : [annotationRecord.body];
                for (const entry of bodies) {
                    const body = asRecord(entry);
                    if (!body) continue;
                    const services = Array.isArray(body.service) ? body.service : [];
                    for (const service of services) {
                        const serviceRecord = asRecord(service);
                        if (!serviceRecord) continue;
                        const id = asString(serviceRecord.id);
                        if (id === null) continue;
                        return id.endsWith("/info.json") ? id : `${id}/info.json`;
                    }
                    // A body that is itself the service description
                    const bodyId = asString(body.id);
                    if (bodyId !== null && bodyId.endsWith("/info.json")) return bodyId;
                }
            }
        }
    }
    return null;
}

/**
 * TileJSON 2.1 metadata from a manifest's map configuration service (§2.9).
 *
 * `tiles` is the only required member, and the value we need is the template,
 * so anything without one is not a tile source. `minzoom`/`maxzoom` are
 * clamped to sane numbers rather than rejected, because a service that
 * advertises a maxzoom of 200 should not fail to load — the map caps it.
 */
function readTilejson(config: Record<string, unknown>): StorymapTilejson | null {
    const record = asRecord(config.tilejson);
    if (!record) return null;
    const tiles = Array.isArray(record.tiles)
        ? asStringArray(record.tiles).filter((t) => t !== "")
        : asString(record.tiles);
    if (Array.isArray(tiles) ? tiles.length === 0 : tiles === null) return null;
    const template = tiles as string | string[];

    const out: StorymapTilejson = { tiles: template };
    const minzoom = asNumber(record.minzoom);
    if (minzoom !== null && minzoom >= 0) out.minzoom = minzoom;
    const maxzoom = asNumber(record.maxzoom);
    if (maxzoom !== null && maxzoom >= 0) out.maxzoom = maxzoom;
    const bounds = readLonLatBox(record.bounds);
    if (bounds !== null) out.bounds = bounds;
    const scheme = asString(record.scheme);
    if (scheme === "xyz" || scheme === "tms") out.scheme = scheme;
    // TileJSON's `center` is [lon, lat, zoom]; the third member is the zoom
    const center = Array.isArray(record.center) ? record.center : null;
    if (center && center.length >= 2) {
        const lon = asNumber(center[0]);
        const lat = asNumber(center[1]);
        if (lon !== null && lat !== null && Math.abs(lon) <= 180 && Math.abs(lat) <= 90) {
            const zoom = center.length > 2 ? asNumber(center[2]) : null;
            if (zoom !== null) out.center = [lon, lat, zoom];
            else out.center = [lon, lat, 0];
        }
    }
    return out;
}

function readMapConfig(manifest: Record<string, unknown>): Record<string, unknown> | null {
    const services = Array.isArray(manifest.service) ? manifest.service : [manifest.service];
    for (const service of services) {
        const record = asRecord(service);
        if (!record) continue;
        const profile = asString(record.profile);
        if (profile !== null && profile.includes(MAPCONFIG_PROFILE)) {
            return record;
        }
    }
    return null;
}

/**
 * What a painting annotation tells us about a slide's media.
 *
 * This is the **shared body record** the annotation-driven stops in
 * docs/plans/iiif-media-tours.md read: `type` is how a `Sound` body is told
 * from an `Image` or a `TextualBody`. Anything else that needs a field from
 * the body belongs on this record rather than in a second reader.
 */
export interface PaintingBody {
    url: string;
    region: [number, number, number, number] | null;
    /** Body class: `Image`, `Sound`, `Video`, `Text`, `Dataset`, … */
    type: string | null;
    format: string | null;
    /** `body.label` — the interoperable caption. */
    label: string | null;
    /** `body.accessibilitySummary` — the interoperable alt text. */
    accessibilitySummary: string | null;
    /**
     * `body.requiredStatement` (label and value), or `body.provider`.
     * See {@link readRequiredStatement} on the single-object shape.
     */
    credit: string | null;
    thumbnail: string | null;
    /** `duration` in seconds, and an explicit `start`/`end` range. */
    duration: number | null;
    start: number | null;
    end: number | null;
    /**
     * A WebVTT subtitle file, from a `TextualBody` body with
     * `format: "text/vtt"` and an `id`. IIIF has no subtitle term, so this is
     * the one standard shape we opportunistically accept; `media.subtitles`
     * in storymap JSON is the documented route.
     */
    subtitles: string | null;
}

/**
 * Credit from `body.requiredStatement`, or `body.provider`, which is where a
 * manifest records who made the media. The statement's `label` is kept, like
 * the manifest-level attribution (§2.1) — a body that says
 * `{label: "Photographer", value: "Someone"}` should not reduce to a bare
 * "Someone".
 */
function readBodyCredit(body: unknown): string | null {
    const record = asRecord(body);
    if (!record) return null;
    const statement = formatAttribution(readRequiredStatement(record.requiredStatement));
    if (statement !== "") return statement;
    const provider = asRecord(record.provider);
    const providerLabel = provider === null ? "" : flattenLanguageMap(provider.label);
    if (providerLabel !== "") return providerLabel;
    return null;
}

/**
 * Credit from the painting annotation's own `requiredStatement`, which is
 * where P3 defines it and where our converter now writes it (§2.7). The
 * `label` is kept, as everywhere else.
 */
function readAnnotationCredit(annotation: Record<string, unknown>): string | null {
    if (annotation.requiredStatement === undefined) return null;
    const statement = formatAttribution(readRequiredStatement(annotation.requiredStatement));
    return statement === "" ? null : statement;
}

/** A `TextualBody` carrying WebVTT is the closest standard spelling of a
 *  subtitle track, so accept it alongside `media.subtitles`. */
function readBodySubtitles(body: unknown): string | null {
    const entries = Array.isArray(body) ? body : [body];
    for (const entry of entries) {
        const record = asRecord(entry);
        if (!record) continue;
        const format = asString(record.format);
        const id = asString(record.id);
        if (format !== null && /^text\/vtt$/i.test(format) && id !== null) return id;
    }
    return null;
}

/** Picks the first body of a `body` array that yields a URL. */
function readFirstTypedBody(body: unknown): Record<string, unknown> | null {
    if (Array.isArray(body)) {
        for (const entry of body) {
            const found = readFirstTypedBody(entry);
            if (found !== null) return found;
        }
        return null;
    }
    const record = asRecord(body);
    if (!record) return null;
    const url = asString(record.id) ?? asString(record.value);
    return url === null ? null : record;
}

/**
 * Reads the slide media URL from the canvas's painting annotation body:
 * typed bodies contribute their `id`, TextualBody (HTML) content its `value`
 * - the legacy format stores both in `media.url`. Also returns the region of
 * a selector on the annotation target, and the body fields listed on
 * {@link PaintingBody}.
 */
function readPainting(
    canvas: Record<string, unknown>,
    width: number | null = null,
    height: number | null = null,
): PaintingBody | null {
    const annotationPages = Array.isArray(canvas.items) ? canvas.items : [];
    for (const page of annotationPages) {
        const pageRecord = asRecord(page);
        if (!pageRecord) continue;
        const annotations = Array.isArray(pageRecord.items) ? pageRecord.items : [];
        for (const annotation of annotations) {
            const annotationRecord = asRecord(annotation);
            if (!annotationRecord) continue;
            const motivation = asString(annotationRecord.motivation);
            if (motivation !== null && motivation !== "painting") continue;
            const body = readFirstTypedBody(annotationRecord.body);
            if (body === null) continue;
            return {
                url: asString(body.id) ?? asString(body.value) ?? "",
                region: readSelector(annotationRecord.target, width, height).region,
                type: asString(body.type),
                format: asString(body.format),
                // P3 puts label / requiredStatement / accessibilitySummary on
                // the Annotation; some producers put them on the body, so the
                // body is still consulted as a fallback (§2.7)
                label:
                    flattenLanguageMap(annotationRecord.label) ||
                    flattenLanguageMap(body.label) ||
                    null,
                accessibilitySummary:
                    flattenLanguageMap(annotationRecord.accessibilitySummary) ||
                    flattenLanguageMap(body.accessibilitySummary) ||
                    null,
                credit: readAnnotationCredit(annotationRecord) ?? readBodyCredit(body),
                thumbnail: readThumbnailId(body.thumbnail),
                duration: asNumber(body.duration),
                start: asNumber(body.start),
                end: asNumber(body.end),
                subtitles: readBodySubtitles(annotationRecord.body),
            };
        }
    }
    return null;
}

/**
 * Reads the slide location from a navPlace FeatureCollection: the first
 * Feature's Point geometry becomes `{lat, lon}` and the Feature properties
 * carry the marker data.
 */
function readLocation(navPlace: unknown): StorymapSlideLocation | null {
    const collection = asRecord(navPlace);
    if (!collection) return null;
    const features = Array.isArray(collection.features) ? collection.features : [];
    for (const feature of features) {
        const location = readFeatureLocation(feature);
        if (location !== null) return location;
    }
    return null;
}

function readFeatureLocation(feature: unknown): StorymapSlideLocation | null {
    const featureRecord = asRecord(feature);
    if (!featureRecord) return null;
    const geometry = asRecord(featureRecord.geometry);
    if (!geometry || asString(geometry.type) !== "Point") return null;
    const coordinates = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
    const lon = asNumber(coordinates[0]);
    const lat = asNumber(coordinates[1]);
    if (lon === null || lat === null) return null;
    const location: StorymapSlideLocation = { lat, lon };
    const properties = asRecord(featureRecord.properties);
    if (properties) {
        const locationProps = location as Record<string, unknown>;
        for (const key of LOCATION_PROPERTIES) {
            const value = properties[key];
            if (value === undefined || value === null || value === "") continue;
            locationProps[key] = value;
        }
    }
    return location;
}

/**
 * Reads a lon/lat bounding box from a navPlace FeatureCollection holding a
 * Polygon or MultiPolygon. The navPlace extension lists "supplying a single
 * geographic bounding box" as a use case, which is the interoperable way to
 * state the extent of a story — the legacy format has no such field, so it
 * becomes `map_bbox` (the map is constrained to the box). Returns null when
 * the collection has no polygon.
 */
function readNavPlaceBbox(navPlace: unknown): [number, number, number, number] | null {
    const collection = asRecord(navPlace);
    if (!collection) return null;
    const features = Array.isArray(collection.features) ? collection.features : [];
    for (const feature of features) {
        const featureRecord = asRecord(feature);
        if (!featureRecord) continue;
        const geometry = asRecord(featureRecord.geometry);
        const type = geometry ? asString(geometry.type) : null;
        if (type !== "Polygon" && type !== "MultiPolygon") continue;
        const positions: number[][] = [];
        collectPositions(geometry?.coordinates, positions, 0);
        const lons = positions.map((p) => p[0]).filter((n) => n !== undefined);
        const lats = positions.map((p) => p[1]).filter((n) => n !== undefined);
        if (lons.length === 0 || lats.length === 0) continue;
        return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
    }
    return null;
}

/** Flattens arbitrarily nested GeoJSON coordinate arrays into positions. */
function collectPositions(value: unknown, out: number[][], depth: number): void {
    if (depth > 4 || !Array.isArray(value)) return;
    if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
        const lon = asNumber(value[0]);
        const lat = asNumber(value[1]);
        if (lon !== null && lat !== null) out.push([lon, lat]);
        return;
    }
    for (const entry of value) {
        collectPositions(entry, out, depth + 1);
    }
}

/**
 * The first id of a P3 `thumbnail`, which is a *list* of content resources
 * (§3.1). A bare resource is accepted too, since that is what a one-element
 * list collapses to once it has been through a few tools.
 */
/**
 * A manifest's `structures` as a slide order and a group per canvas (§3.5).
 *
 * Two jobs, both of which the ecosystem expects — Annona's range storyboard
 * and TimelineJS's groups:
 *
 * 1. a Range with a `label` and **no `start`** is a *group* for its member
 *    canvases, which is the first meaning the inert `slide.group` field ever
 *    had. A Range with a `start` is a time segment of one canvas, not a group,
 *    so it is skipped.
 * 2. the order canvases appear in, which is the curated sequence. That is the
 *    whole point of a storyboard: it may run the canvases in an order the
 *    document does not.
 *
 * Nested Ranges are chapters inside the group, so the outermost labelled Range
 * is the group a slide belongs to — `slide.group` is one string, and a
 * "Part 1 / Chapter 2" pair is more use to a host as the part.
 */
function readStructures(value: unknown): {
    order: string[];
    groups: Map<string, string>;
} {
    const order: string[] = [];
    const groups = new Map<string, string>();
    const seen = new Set<string>();

    const walk = (entries: unknown, group: string | null): void => {
        for (const entry of Array.isArray(entries) ? entries : [entries]) {
            // P3 lets a Range's `items` be a list of ids, of resource objects,
            // or a mix; only the ids matter here
            const bare = asString(entry);
            if (bare !== null) {
                if (!seen.has(bare)) {
                    seen.add(bare);
                    order.push(bare);
                    if (group !== null) groups.set(bare, group);
                }
                continue;
            }
            const record = asRecord(entry);
            if (!record) continue;
            const isRange = asString(record.type) === "Range";
            if (!isRange) {
                // a canvas or annotation resource reference in items
                const id = asString(record.id);
                if (id !== null && !seen.has(id)) {
                    seen.add(id);
                    order.push(id);
                    if (group !== null) groups.set(id, group);
                }
                continue;
            }
            const label = flattenLanguageMap(record.label);
            const isGroup = label !== "" && record.start === undefined;
            const nextGroup = isGroup ? (group ?? label) : group;
            walk(record.items, nextGroup);
        }
    };

    walk(value, null);
    return { order, groups };
}

/**
 * An Agent as a credit fragment: its label, or its id when it has none. An
 * empty `label` produces a bare fragment, which is what a homepage-only Agent
 * wants (§3.2).
 */
function agentCredit(value: unknown, label: string): string {
    const entries = Array.isArray(value) ? value : [value];
    const parts: string[] = [];
    for (const entry of entries) {
        const record = asRecord(entry);
        if (!record) continue;
        const name = flattenLanguageMap(record.label) || asString(record.id) || "";
        if (name === "") continue;
        parts.push(label === "" ? name : `${label}: ${name}`);
    }
    return parts.join(", ");
}

/**
 * P3 `metadata` as plain `{label, value}` pairs (§3.2). Entries without both a
 * label and a value are dropped, since a pair with neither says nothing.
 */
function readMetadata(value: unknown): { label: string; value: string }[] {
    const entries = Array.isArray(value) ? value : [value];
    const out: { label: string; value: string }[] = [];
    for (const entry of entries) {
        const record = asRecord(entry);
        if (!record) continue;
        const label = flattenLanguageMap(record.label);
        const text = flattenLanguageMap(record.value);
        if (label === "" && text === "") continue;
        out.push({ label, value: text });
    }
    return out;
}

function readThumbnailId(value: unknown): string | null {
    const entries = Array.isArray(value) ? value : [value];
    for (const entry of entries) {
        const id = asString(asRecord(entry)?.id);
        if (id !== null) return id;
    }
    return null;
}

/**
 * A canvas's P3 `background` annotation into a slide background (§2.6).
 *
 * The annotation is a painting annotation whose body is the image and/or the
 * colour; an image body contributes `url` and a `Color` body contributes
 * `color`.
 *
 * The result is always the object form. The bare-string form of
 * `slide.background` means a *colour* — that is what the converter has always
 * done with it — so returning a url as a bare string would read back as a
 * colour on the next trip.
 *
 * `opacity` is not read. IIIF has no vocabulary for a background opacity and
 * the viewer never rendered one, so nothing is lost by leaving it out.
 */
function readBackground(annotation: unknown): StorymapSlideBackground | string | null {
    const record = asRecord(annotation);
    if (!record) return null;
    const bodies = Array.isArray(record.body) ? record.body : [record.body];
    let url: string | null = null;
    let color: string | null = null;
    for (const entry of bodies) {
        const body = asRecord(entry);
        if (!body) continue;
        if (url === null && isMediaBody(body)) {
            url = asString(body.id);
        }
        if (color === null) {
            const type = asString(body.type);
            const value = asString(body.value);
            if (value !== null && (type === "Color" || type === null)) color = value;
        }
    }
    const background: StorymapSlideBackground = {};
    if (url !== null) background.url = url;
    if (color !== null) background.color = color;
    return Object.keys(background).length > 0 ? background : null;
}

function canvasToSlide(
    canvas: unknown,
    manifestFeature: unknown,
    preferredLanguage: string | null = null,
): StorymapSlide | null {
    const record = asRecord(canvas);
    if (!record) return null;

    const slide: StorymapSlide = {};

    // text: Canvas label → headline, Canvas summary → body text, both in the
    // language the viewer is configured for (§3.4)
    const label = pickLanguageMap(record.label, preferredLanguage);
    const summary = pickLanguageMap(record.summary, preferredLanguage);
    const headline = label.value;
    const text = summary.value;
    if (headline !== "" || text !== "") {
        slide.text = {};
        if (headline !== "") slide.text.headline = headline;
        if (text !== "") slide.text.text = text;
    }
    // Which language this slide's text came from, so a host can offer a
    // language switch. `none` is language-neutral, so it is not reported.
    const language = label.language ?? summary.language;
    if (language !== null) slide.language = language;

    // media: the painting annotation's body, with its label /
    // requiredStatement / accessibilitySummary as caption, credit and alt
    // text (§2.7 — the `mediaCaption`/`mediaCredit`/`mediaAlt` canvas terms are
    // gone). srcset/sizes remain terms: IIIF has no vocabulary for either.
    const painting = readPainting(record, asNumber(record.width), asNumber(record.height));
    const caption = painting?.label ?? null;
    const credit = painting?.credit ?? null;
    const alt = painting?.accessibilitySummary ?? null;
    const srcset = asString(readTerm(record, "mediaSrcset"));
    const sizes = asString(readTerm(record, "mediaSizes"));
    // P3 allows the thumbnail on the body or on the canvas, and real manifests
    // use both; the body's wins because it describes the painted resource
    // specifically
    const thumbnail = painting?.thumbnail ?? readThumbnailId(record.thumbnail);
    if (
        painting !== null ||
        caption !== null ||
        credit !== null ||
        alt !== null ||
        srcset !== null ||
        sizes !== null ||
        thumbnail !== null
    ) {
        const media: StorymapSlideMedia = {};
        if (painting !== null) media.url = painting.url;
        if (caption !== null) media.caption = caption;
        if (credit !== null) media.credit = credit;
        if (alt !== null) media.alt = alt;
        if (srcset !== null) media.srcset = srcset;
        if (sizes !== null) media.sizes = sizes;
        if (thumbnail !== null) media.thumb = thumbnail;
        if (painting?.subtitles != null) media.subtitles = painting.subtitles;
        slide.media = media;
    }

    // location: canvas navPlace, falling back to a manifest-level navPlace
    // aggregated in items order (both are allowed by the proposal)
    const location = readLocation(record.navPlace) ?? readFeatureLocation(manifestFeature);
    if (location !== null) slide.location = location;
    // IIIF xywh region (StrollView-style image stops): [x, y, w, h] pixels.
    // The extension term wins over the interoperable spelling — an Image API
    // Selector on the painting annotation target
    // region: the painting annotation's target selector, the only source since
    // the storymap:imageRegion term went (§2.8)
    const region = painting?.region ?? null;
    if (region !== null) {
        slide.location = { ...(slide.location ?? {}), region };
    }

    // StoryMap extension terms
    const slideType = asString(record[STORYMAP_PREFIX + "type"]);
    if (slideType !== null) slide.type = slideType;
    // P3's `navDate`, a string. A language map is read for leniency, since
    // other producers do emit one, but the official validator rejects it and
    // we never write one (§2.5).
    const navDate = record.navDate;
    const dateString = asString(navDate) ?? flattenLanguageMap(navDate);
    const dateRecord = asRecord(navDate);
    if (dateString !== null && dateString !== "") slide.date = dateString;
    else if (dateRecord !== null) slide.date = dateRecord;
    // background: the canvas's standard `background` painting annotation. The
    // storymap:background term is gone (§2.6).
    const background = readBackground(record.background);
    if (background !== null) slide.background = background;

    return slide;
}

/**
 * Motivations that turn an annotation into a tour stop. `painting` is the
 * canvas's image and is handled separately; everything here is commentary
 * about it, which is what a guided tour is made of.
 */
const STOP_MOTIVATIONS = new Set(["commenting", "tagging", "classifying", "describing"]);

/** Escapes the five characters that would otherwise be markup, so a
 *  `text/plain` annotation body cannot inject HTML. The renderer sanitizes
 *  slide text as well; this keeps the stored value honest on its own. */
function escapeText(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * A `text/plain` body becomes one paragraph per blank-line-separated block,
 * escaped. A `text/html` body is passed through as markup — the slide text
 * pipeline (`sanitizeSlideText`, via `media/types/Text.ts`) sanitizes whatever
 * it is given, which is the same path a storymap JSON `text.text` takes.
 */
function annotationTextToSlideText(format: string | null, value: string): string | null {
    if (value.trim() === "") return null;
    const is_html = format !== null && /^text\/html/i.test(format);
    if (is_html) return value;
    const blocks = value
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter((block) => block !== "");
    if (blocks.length === 0) return null;
    return blocks.map((block) => `<p>${escapeText(block)}</p>`).join("");
}

/** True for a body that is a media resource rather than text. */
function isMediaBody(body: Record<string, unknown>): boolean {
    const id = asString(body.id);
    if (id === null) return false;
    const type = asString(body.type);
    if (type !== null) {
        return ["Image", "Sound", "Video", "Dataset", "Model"].includes(type);
    }
    // An untyped body with an id is a media resource by P3 convention.
    return true;
}

/**
 * One annotation → one tour stop, or null when it is not a stop.
 *
 * A stop needs somewhere to go: the target has to resolve to a region, either
 * from an `xywh` fragment / Image API Selector or from a `PointSelector`
 * (synthesized into a square by `readSelector`, which needs the canvas size).
 * An annotation targeting the whole canvas is not a stop — the canvas slide
 * already covers it.
 *
 * The body may be one resource or an array. A `TextualBody` contributes the
 * slide text, a typed media body (typically a `Sound`) contributes
 * `media.url`, and both contribute caption/credit/alt.
 */
function readAnnotationStop(
    annotation: unknown,
    width: number | null,
    height: number | null,
): StorymapSlide | null {
    const record = asRecord(annotation);
    if (!record) return null;

    const motivations = Array.isArray(record.motivation) ? record.motivation : [record.motivation];
    const is_stop = motivations.some((m) => {
        const value = asString(m);
        return value !== null && STOP_MOTIVATIONS.has(value);
    });
    if (!is_stop) return null;

    const selector = readSelector(record.target, width, height);
    if (selector.region === null) return null;

    const bodies = Array.isArray(record.body) ? record.body : [record.body];
    let text: string | null = null;
    let media: StorymapSlideMedia | null = null;

    for (const entry of bodies) {
        const body = asRecord(entry);
        if (!body) continue;
        if (isMediaBody(body)) {
            if (media === null) {
                const url = asString(body.id);
                if (url !== null) {
                    // Same precedence as readPainting: the annotation's own
                    // P3 properties first, the body's as a fallback (§2.7)
                    const caption =
                        flattenLanguageMap(record.label) || flattenLanguageMap(body.label);
                    const credit = readAnnotationCredit(record) ?? readBodyCredit(body);
                    const alt =
                        flattenLanguageMap(record.accessibilitySummary) ||
                        flattenLanguageMap(body.accessibilitySummary);
                    media = {
                        url,
                        ...(caption !== "" ? { caption } : {}),
                        ...(credit !== null ? { credit } : {}),
                        ...(alt !== "" ? { alt } : {}),
                        ...(readThumbnailId(body.thumbnail) !== null
                            ? { thumb: readThumbnailId(body.thumbnail) as string }
                            : {}),
                    };
                }
            }
            continue;
        }
        if (text === null) {
            const value = asString(body.value);
            if (value !== null) {
                text = annotationTextToSlideText(asString(body.format), value);
            }
        }
    }

    // An annotation carrying nothing but a target is still a usable stop: it
    // focuses the image on a region.
    if (text === null && media === null) return null;

    // The annotation's own label is the stop's headline, which is what the
    // slider and the marker label show. A body `label` is the media caption and
    // is handled above.
    const headline = flattenLanguageMap(record.label);

    const slide: StorymapSlide = { location: { region: selector.region } };
    if (text !== null || headline !== "") {
        slide.text = {
            ...(text !== null ? { text } : {}),
            ...(headline !== "" ? { headline } : {}),
        };
    }
    if (media !== null) slide.media = media;
    return slide;
}

/**
 * Annotation-driven tour stops for one canvas, in annotation page order.
 * Appended after the canvas's own slide, so the story reads "here is the
 * whole picture, then here is each detail".
 */
export function readCommentingAnnotations(canvas: unknown): StorymapSlide[] {
    const record = asRecord(canvas);
    if (!record) return [];
    const width = asNumber(record.width);
    const height = asNumber(record.height);

    const stops: StorymapSlide[] = [];
    const annotationPages = Array.isArray(record.items) ? record.items : [];
    for (const page of annotationPages) {
        const annotations = asRecord(page);
        if (!annotations || !Array.isArray(annotations.items)) continue;
        for (const annotation of annotations.items) {
            const stop = readAnnotationStop(annotation, width, height);
            if (stop !== null) stops.push(stop);
        }
    }
    return stops;
}

/** An external resource a manifest points at with `seeAlso`. */
export type SeeAlsoReference = {
    id: string;
    /** The IIIF class, which is what tells us how to read it. */
    type: string;
};

/**
 * The `seeAlso` targets of a manifest, canvas or range.
 *
 * The class is recorded because it is what decides how a target is read: an
 * `AnnotationCollection` or `AnnotationPage` is a list of annotations to merge,
 * while a `SearchService1` is an endpoint to hand to a host rather than
 * annotations to load. An untyped entry is reported as `unknown` rather than
 * guessed at, because fetching a URI on the strength of a guess is how a viewer
 * ends up dereferencing something it should not have.
 */
export function collectSeeAlso(value: unknown): SeeAlsoReference[] {
    const record = asRecord(value);
    if (!record) return [];
    const entries = Array.isArray(record.seeAlso) ? record.seeAlso : [record.seeAlso];
    const out: SeeAlsoReference[] = [];
    for (const entry of entries) {
        const linked = asRecord(entry);
        if (!linked) continue;
        const id = asString(linked.id) ?? asString(linked);
        if (id === null) continue;
        out.push({ id, type: asString(linked.type) ?? "unknown" });
    }
    return out;
}

/** Every `seeAlso` a manifest points at: its own, plus one per canvas. */
export function collectManifestSeeAlso(manifest: unknown): SeeAlsoReference[] {
    const record = asRecord(manifest);
    if (!record) return [];
    const seen = new Set<string>();
    const out: SeeAlsoReference[] = [];
    const add = (reference: SeeAlsoReference) => {
        if (seen.has(reference.id)) return;
        seen.add(reference.id);
        out.push(reference);
    };
    for (const reference of collectSeeAlso(record)) add(reference);
    const canvases = Array.isArray(record.items) ? record.items : [];
    for (const canvas of canvases) {
        for (const reference of collectSeeAlso(canvas)) add(reference);
    }
    return out;
}

/** The canvas an annotation targets, with a `#xywh=` fragment stripped. */
function canvasIdOfTarget(target: unknown): string | null {
    const text = asString(target);
    if (text !== null) {
        const at = text.indexOf("#");
        return at === -1 ? text : text.slice(0, at);
    }
    const record = asRecord(target);
    if (!record) return null;
    if (record.source !== undefined) {
        const source = asString(record.source) ?? asString(asRecord(record.source)?.id);
        return source;
    }
    return asString(record.id);
}

function pushAnnotation(annotation: unknown, byCanvas: Map<string, unknown[]>): void {
    const record = asRecord(annotation);
    if (!record) return;
    const canvasId = canvasIdOfTarget(record.target);
    if (canvasId === null) return;
    const list = byCanvas.get(canvasId);
    if (list === undefined) byCanvas.set(canvasId, [annotation]);
    else list.push(annotation);
}

function pushPageItems(page: Record<string, unknown>, byCanvas: Map<string, unknown[]>): void {
    const items = Array.isArray(page.items) ? page.items : [];
    for (const annotation of items) {
        pushAnnotation(annotation, byCanvas);
    }
}

/**
 * The annotations of an external page, indexed by canvas id, plus the
 * annotation-page URLs it refers to.
 *
 * One `AnnotationCollection` can carry annotations for many canvases, and a
 * canvas's annotations may be split across several referenced pages, so a
 * collection, a single page, and a bare list of annotations are all accepted.
 */
function indexExternalAnnotations(document: unknown): {
    byCanvas: Map<string, unknown[]>;
    pages: string[];
} {
    const byCanvas = new Map<string, unknown[]>();
    const pages: string[] = [];
    const record = asRecord(document);
    if (!record) return { byCanvas, pages };

    const type = asString(record.type);
    if (type === "AnnotationPage") {
        pushPageItems(record, byCanvas);
        const id = asString(record.id);
        if (id !== null) pages.push(id);
        return { byCanvas, pages };
    }
    if (type === "AnnotationCollection") {
        const items = Array.isArray(record.items) ? record.items : [];
        for (const item of items) {
            const entry = asRecord(item);
            if (!entry) continue;
            // A referenced page rather than an embedded annotation. The type
            // is what tells them apart: an `Annotation` also has an `id` and
            // no `items`, so keying on the absence of `items` alone sent every
            // annotation back out to be fetched as a page of its own.
            const entryType = asString(entry.type);
            const isReference =
                entry.items === undefined &&
                (entryType === "AnnotationPage" || entryType === "AnnotationCollection") &&
                asString(entry.id) !== null;
            if (isReference) {
                pages.push(asString(entry.id) as string);
                continue;
            }
            // A collection's item is either an embedded page (which carries its
            // own `items`) or a bare annotation, and a bare annotation has no
            // `items` of its own — reading it as a page-shaped object silently
            // dropped every annotation in the collection.
            if (entry.items !== undefined) pushPageItems(entry, byCanvas);
            else pushAnnotation(entry, byCanvas);
        }
        return { byCanvas, pages };
    }
    return { byCanvas, pages };
}

export type ExternalAnnotations = {
    /** Tour stops, keyed by the canvas id they annotate. */
    stops: Map<string, StorymapSlide[]>;
    /** A `SearchService1` seen along the way, for a host to query. */
    searchService: string | null;
    /** Annotation-page URLs that could not be read, for a console report. */
    failed: string[];
};

/**
 * A per-(id, type) cache of fetched annotation documents.
 *
 * Keyed on both, because the same URI can be reached as a collection and as a
 * page and the two are read differently. The *promise* is cached rather than
 * the result, so two callers racing the same page share one request.
 */
const annotationCache = new Map<string, Promise<unknown>>();

/** Forget every cached annotation document. Exported for tests. */
export function clearSeeAlsoCache(): void {
    annotationCache.clear();
}

/**
 * Read the annotation documents a manifest points at with `seeAlso`.
 *
 * Asynchronous by design, and deliberately not called from
 * `manifestToStorymapData`: a manifest can point at anything, a viewer should
 * not block its first paint on a third party, and a host needs to decide whether
 * it wants the extra round trips at all. One level is followed — a referenced
 * `AnnotationPage` inside a collection is fetched, but a `seeAlso` *inside* that
 * page is not — which is what keeps a cycle from becoming an infinite walk.
 *
 * A `SearchService1` is recorded and not followed: it is an endpoint for a host
 * to query, not a list of annotations to load.
 */
export async function loadSeeAlso(
    manifest: unknown,
    options: { fetchImpl?: typeof fetch } = {},
): Promise<ExternalAnnotations> {
    const result: ExternalAnnotations = { stops: new Map(), searchService: null, failed: [] };
    const record = asRecord(manifest);
    if (!record) return result;

    const impl = options.fetchImpl ?? fetch;
    const canvases = Array.isArray(record.items) ? record.items : [];
    const wanted = collectManifestSeeAlso(record);

    const stopCollector = async (annotations: unknown[], canvasId: string): Promise<void> => {
        const canvas = canvasStub(canvasId, canvases);
        if (canvas === null) return;
        const stops = readCommentingAnnotations({
            ...(asRecord(canvas) as Record<string, unknown>),
            items: [{ type: "AnnotationPage", items: annotations }],
        });
        if (stops.length === 0) return;
        const existing = result.stops.get(canvasId);
        if (existing === undefined) result.stops.set(canvasId, stops);
        else existing.push(...stops);
    };

    await Promise.all(
        wanted.map(async (reference) => {
            if (reference.type === "SearchService1") {
                result.searchService = reference.id;
                return;
            }
            if (
                reference.type !== "AnnotationCollection" &&
                reference.type !== "AnnotationPage" &&
                reference.type !== "unknown"
            ) {
                return;
            }
            const loaded = await loadDocument(reference, impl, result);
            if (loaded === null) return;
            for (const [canvasId, annotations] of loaded.byCanvas) {
                await stopCollector(annotations, canvasId);
            }
            for (const pageId of loaded.pages) {
                const page = await loadDocument(
                    { id: pageId, type: "AnnotationPage" },
                    impl,
                    result,
                );
                if (page === null) continue;
                for (const [canvasId, annotations] of page.byCanvas) {
                    await stopCollector(annotations, canvasId);
                }
            }
        }),
    );

    return result;
}

/**
 * The canvas object an external annotation names, or null when the manifest
 * does not have that canvas.
 *
 * Null rather than a synthetic stub on purpose: the plan merges external
 * annotations "for the canvases we render", so an annotation aimed at a canvas
 * this story does not carry is not a tour stop. A stub would also invent a
 * canvas with no size, leaving a region with nothing to be relative to.
 */
function canvasStub(canvasId: string, manifestCanvases: unknown[]): unknown {
    for (const canvas of manifestCanvases) {
        const record = asRecord(canvas);
        if (record !== null && asString(record.id) === canvasId) return record;
    }
    return null;
}

async function loadDocument(
    reference: SeeAlsoReference,
    impl: typeof fetch,
    result: ExternalAnnotations,
): Promise<{ byCanvas: Map<string, unknown[]>; pages: string[] } | null> {
    const key = `${reference.type} ${reference.id}`;
    let pending = annotationCache.get(key);
    if (pending === undefined) {
        pending = impl(reference.id, {
            headers: { Accept: "application/ld+json, application/json" },
        })
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json() as Promise<unknown>;
            })
            .catch((error: unknown) => {
                // a cached rejection would be remembered forever, so drop it
                // and let a later call retry
                annotationCache.delete(key);
                throw error;
            });
        annotationCache.set(key, pending);
    }
    try {
        return indexExternalAnnotations(await pending);
    } catch (error) {
        result.failed.push(reference.id);
        console.warn(
            `StoryMapJS: the seeAlso target could not be read: ${reference.id}`,
            error instanceof Error ? error.message : error,
        );
        return null;
    }
}

/**
 * Converts a IIIF Presentation API 3.0 manifest into legacy StoryMapJS data
 * (the `storymap` object). Malformed or missing pieces are skipped; the
 * result always contains at least `{slides: []}`.
 */
export function manifestToStorymapData(manifest: unknown): StorymapData {
    const data: StorymapData = { slides: [] };
    const record = asRecord(manifest);
    if (!record) return data;

    // A Collection is not a Manifest, but it is a legitimate IIIF input: its
    // member Manifests' canvases concatenate into one linear story (§2.2)
    if (isPresentation3Collection(record)) {
        return collectionToStorymapData(record);
    }

    const title = flattenLanguageMap(record.label);
    if (title !== "") data.title = title;

    // A slide is addressed by its Canvas id, falling back to the Manifest's
    // (§2.3). The viewer already resolves deep links by `uniqueid`
    // (`StorySlider.goToId`) and generates one when falsy, so this is what
    // makes a manifest stop shareable by its canonical id.
    const manifestId = asString(record.id);

    // Manifest-level map configuration service → storymap options fields.
    const config = readMapConfig(record);
    if (config) {
        applyMapConfig(data, config);
    }

    // georeferenced IIIF images (Georeference Extension) sit above the
    // term-based overlay layers. The annotations are canvas-scoped but the
    // layers they describe are map-wide, so they are collected from *every*
    // canvas: a layer annotated on canvas 0 must not disappear for the rest
    // of the story (§2.10).
    const georeferenced = readGeoreferencedLayers(record);
    if (georeferenced.length > 0) {
        const existing = (data.overlays as StorymapOverlayLayer[] | undefined) ?? [];
        data.overlays = [...existing, ...georeferenced];
    }

    // An image basemap is a painting body carrying an Image API service in
    // `service[]`; its base is where `iiif.url` comes from (§2.4). Gated on
    // map_type "iiif" because an ordinary slide can just as easily be an IIIF
    // image, and only the basemap one is the map.
    if (data.map_type === "iiif") {
        const imageService = readImageServiceUrl(record);
        if (imageService !== null) data.iiif = { url: imageService, attribution: "" };
    }

    // Institutional credit: the manifest's own `requiredStatement`, then who
    // provided it and under what licence. All of it lands on the one credit
    // string the viewer renders, so a licence stated in the manifest is
    // actually shown rather than silently dropped (§3.2).
    const credit = [
        formatAttribution(readRequiredStatement(record.requiredStatement)),
        agentCredit(record.provider, "Provider"),
        asString(record.rights) !== null ? `Licence: ${asString(record.rights)}` : "",
        // an Agent with only a homepage still says who published this
        agentCredit(record.homepage, ""),
    ]
        .filter((part) => part !== "")
        .join(" · ");
    if (credit !== "") {
        const iiif = (data.iiif as { url?: string; attribution?: string } | undefined) ?? {};
        iiif.attribution = credit;
        if (iiif.url === undefined) iiif.url = "";
        data.iiif = iiif;
    }

    // `logo` is an image, not a credit line, so it is offered as data for a
    // host to show (§3.2)
    const logo = asString(asRecord(record.logo)?.id);
    if (logo !== null) data.logo = logo;

    // `metadata` is a list of label/value pairs, which cannot be rendered
    // generically — they are handed on as data (§3.2)
    const metadata = readMetadata(record.metadata);
    if (metadata.length > 0) data.metadata = metadata;

    // The `seeAlso` targets are recorded but not followed here: reading them is
    // a network round trip per document, and a viewer should not block its
    // first paint on a third party. `loadSeeAlso()` fetches them on request,
    // behind its own cache, and the storymap's own slides stand on their own
    // meanwhile (§5.2).
    const seeAlso = collectManifestSeeAlso(record);
    if (seeAlso.length > 0) data.see_also = seeAlso;

    // items[] (Canvases) → slides[], in order
    const items = Array.isArray(record.items) ? record.items : [];
    const manifestNavPlace = asRecord(record.navPlace);
    const manifestFeatures =
        manifestNavPlace && Array.isArray(manifestNavPlace.features)
            ? manifestNavPlace.features
            : [];

    // `structures` states the curated order and the groups (§3.5). A Range
    // with a label and no `start` is a group; nested Ranges are chapters
    // within it, and a Range whose items run in a different order than the
    // canvases is a storyboard. Either way the order comes from here, not
    // from the document.
    const structures = readStructures(record.structures);
    const order = new Map<string, number>();
    for (const [position, canvasId] of structures.order.entries()) {
        order.set(canvasId, position);
    }
    const indexes = items.map((_item, index) => index);
    indexes.sort((a, b) => {
        const ia = order.get(asString(asRecord(items[a])?.id) ?? "");
        const ib = order.get(asString(asRecord(items[b])?.id) ?? "");
        // a canvas no Range mentions keeps its document position, after the
        // ones a Range does mention
        if (ia === undefined && ib === undefined) return a - b;
        if (ia === undefined) return 1;
        if (ib === undefined) return -1;
        return ia - ib;
    });

    for (const index of indexes) {
        // The canvas index, not the output-slide index: annotation stops
        // appended below shift the slide array, and the manifest-level
        // navPlace features line up with canvases.
        const canvasId = asString(asRecord(items[index])?.id);
        const slide = canvasToSlide(
            items[index],
            manifestFeatures[index],
            asString(data.language) ?? null,
        );
        if (slide !== null) {
            slide.uniqueid = canvasId ?? manifestId ?? "";
            if (canvasId !== null) {
                const group = structures.groups.get(canvasId);
                if (group !== undefined) slide.group = group;
            }
            data.slides.push(slide);
        }
        // Annotation-driven tour stops, in annotation page order. They share
        // the canvas they annotate, suffixed so they stay addressable and do
        // not collide with it.
        for (const stop of readCommentingAnnotations(items[index])) {
            if (canvasId) {
                stop.uniqueid = `${canvasId}#${data.slides.length}`;
            }
            data.slides.push(stop);
        }
        // A polygon navPlace states the geographic extent of the story
        // ("supplying a single geographic bounding box" in the navPlace
        // extension), which the legacy format expresses as map_bbox. The
        // first canvas carrying one wins; Point navPlaces are unaffected.
        if (data.map_bbox === undefined) {
            const canvas = asRecord(items[index]);
            const bbox =
                (canvas ? readNavPlaceBbox(canvas.navPlace) : null) ??
                readNavPlaceBbox(record.navPlace);
            if (bbox !== null) data.map_bbox = bbox;
        }
    }

    return data;
}

/** Copies the mapconfig service terms onto the storymap data root (legacy keys). */
function applyMapConfig(data: StorymapData, config: Record<string, unknown>): void {
    // The basemap is either a keyword or a tile source: `storymap:basemap`
    // names one the viewer knows how to configure (osm, stadia, iiif, …) and
    // TileJSON describes an arbitrary tile service. `mapType` used to carry
    // both in one string, which is why a URL template and a vendor keyword
    // were the same field (§2.9).
    const basemap = asString(readTerm(config, "basemap"));
    if (basemap !== null && basemap !== "") {
        data.map_type = basemap;
    } else {
        const tilejson = readTilejson(config);
        if (tilejson !== null) {
            data.map_type = Array.isArray(tilejson.tiles) ? tilejson.tiles[0] : tilejson.tiles;
            data.tilejson = tilejson;
        }
    }

    const mapAsImage = asBoolean(readTerm(config, "mapAsImage"));
    if (mapAsImage !== null) data.map_as_image = mapAsImage;

    const mapAccessToken = asString(readTerm(config, "mapAccessToken"));
    if (mapAccessToken !== null) data.map_access_token = mapAccessToken;

    const mapBackgroundColor = asString(readTerm(config, "mapBackgroundColor"));
    if (mapBackgroundColor !== null) data.map_background_color = mapBackgroundColor;

    const mapCenterOffset = asRecord(readTerm(config, "mapCenterOffset"));
    if (mapCenterOffset) {
        const left = asNumber(mapCenterOffset.left);
        const top = asNumber(mapCenterOffset.top);
        if (left !== null && top !== null) data.map_center_offset = { left, top };
    }

    const fontCss = asString(readTerm(config, "fontCss"));
    if (fontCss !== null) data.font_css = fontCss;

    const callToAction = asBoolean(readTerm(config, "callToAction"));
    if (callToAction !== null) data.call_to_action = callToAction;

    const callToActionText = asString(readTerm(config, "callToActionText"));
    if (callToActionText !== null) data.call_to_action_text = callToActionText;

    const startAtSlide = asNumber(readTerm(config, "startAtSlide"));
    if (startAtSlide !== null) data.start_at_slide = startAtSlide;

    const language = asString(readTerm(config, "language"));
    if (language !== null) data.language = language;

    const calculateZoom = asBoolean(readTerm(config, "calculateZoom"));
    if (calculateZoom !== null) data.calculate_zoom = calculateZoom;

    const lineFollowsPath = asBoolean(readTerm(config, "lineFollowsPath"));
    if (lineFollowsPath !== null) data.line_follows_path = lineFollowsPath;

    const showLines = asBoolean(readTerm(config, "showLines"));
    if (showLines !== null) data.show_lines = showLines;

    const showHistoryLine = asBoolean(readTerm(config, "showHistoryLine"));
    if (showHistoryLine !== null) data.show_history_line = showHistoryLine;

    const lineColor = asString(readTerm(config, "lineColor"));
    if (lineColor !== null) data.line_color = lineColor;

    const lineColorInactive = asString(readTerm(config, "lineColorInactive"));
    if (lineColorInactive !== null) data.line_color_inactive = lineColorInactive;

    const lineWeight = asNumber(readTerm(config, "lineWeight"));
    if (lineWeight !== null) data.line_weight = lineWeight;

    const lineOpacity = asNumber(readTerm(config, "lineOpacity"));
    if (lineOpacity !== null) data.line_opacity = lineOpacity;

    const lineDash = asString(readTerm(config, "lineDash"));
    if (lineDash !== null) data.line_dash = lineDash;

    const lineJoin = asString(readTerm(config, "lineJoin"));
    if (lineJoin !== null) data.line_join = lineJoin;

    const useCustomMarkers = asBoolean(readTerm(config, "useCustomMarkers"));
    if (useCustomMarkers !== null) data.use_custom_markers = useCustomMarkers;

    // landscape map layout: "full" (default) or "left"
    const mapArea = asString(readTerm(config, "mapArea"));
    if (mapArea === "full" || mapArea === "left") data.map_area = mapArea;

    const overviewExtent = readLonLatBox(readTerm(config, "overviewExtent"));
    if (overviewExtent !== null) data.overview_extent = overviewExtent;

    const keyboard = asBoolean(readTerm(config, "keyboard"));
    if (keyboard !== null) data.keyboard = keyboard;

    // stacked layers above the basemap, as extension-term entries
    const overlays = readOverlays(readTerm(config, "overlays"));
    if (overlays.length > 0) data.overlays = overlays;
}

/** Reads a `[west, south, east, north]` lon/lat box of four finite numbers. */
function readLonLatBox(value: unknown): [number, number, number, number] | null {
    if (!isLonLatBox(value)) return null;
    const [west, south, east, north] = value;
    if (east <= west || north <= south) return null;
    return [west, south, east, north];
}

/** Reads the shared presentation keys of an `overlays[]` entry. */
function readOverlayPresentation(
    record: Record<string, unknown>,
    entry: StorymapOverlayLayer,
): void {
    const opacity = asNumber(record.opacity);
    if (opacity !== null) entry.opacity = opacity;
    const visible = asBoolean(record.visible);
    if (visible !== null) entry.visible = visible;
    const attribution = asString(record.attribution);
    if (attribution !== null) entry.attribution = attribution;
    const className = asString(record.className);
    if (className !== null) entry.className = className;
    const blendMode = asString(record.blendMode);
    if (blendMode !== null) entry.blendMode = blendMode;
    const extent = readLonLatBox(record.extent);
    if (extent !== null) entry.extent = extent;
}

/**
 * Reads `storymap:overlays`: stacked raster layers, each naming any
 * `map_type` the tile layer factory accepts plus declarative presentation.
 * Entries without a `map_type` are dropped here (the map skips them too).
 */
function readOverlays(value: unknown): StorymapOverlayLayer[] {
    if (!Array.isArray(value)) return [];
    const overlays: StorymapOverlayLayer[] = [];
    for (const item of value) {
        const record = asRecord(item);
        if (!record) continue;
        const mapType = asString(record.map_type);
        if (mapType === null || mapType === "") continue;
        const entry: StorymapOverlayLayer = { map_type: mapType };
        readOverlayPresentation(record, entry);
        overlays.push(entry);
    }
    return overlays;
}

/**
 * IIIF images placed on the geographic map, from the Georeference Extension's
 * `motivation: "georeferencing"` annotations (§2.10).
 *
 * Per the extension, a layer that is not part of the canvas it ships in — which
 * is every map layer — carries the image it places in `target` as an embedded
 * resource, and the ground control points in `body` as a FeatureCollection
 * whose features carry `resourceCoords`.
 *
 * The annotations are read from every canvas, because the layers they describe
 * are map-wide. Entries without a usable image or without ground control points
 * are dropped; whether the points can be placed affinely is the map's decision.
 *
 * `requiredStatement` is read as the layer's attribution, which is where P3 puts
 * attribution. The term also carried `opacity`, `visible`, `className`,
 * `blendMode` and `extent`; none of those has IIIF vocabulary for a
 * georeferencing annotation, so they no longer round-trip. The extent is not
 * lost in substance — the control points describe it.
 */
function readGeoreferencedLayers(manifest: Record<string, unknown>): StorymapOverlayLayer[] {
    const overlays: StorymapOverlayLayer[] = [];
    const canvases = Array.isArray(manifest.items) ? manifest.items : [];
    for (const canvas of canvases) {
        const canvasRecord = asRecord(canvas);
        if (!canvasRecord) continue;
        const pages = Array.isArray(canvasRecord.items) ? canvasRecord.items : [];
        for (const page of pages) {
            const pageRecord = asRecord(page);
            if (!pageRecord) continue;
            const annotations = Array.isArray(pageRecord.items) ? pageRecord.items : [];
            for (const annotation of annotations) {
                const record = asRecord(annotation);
                if (!record) continue;
                const motivations = Array.isArray(record.motivation)
                    ? record.motivation
                    : [record.motivation];
                if (!motivations.some((m) => asString(m) === "georeferencing")) continue;

                const target = asRecord(record.target);
                if (!target) continue;
                const url = asString(target.id);
                if (url === null) continue;
                const width = asNumber(target.width);
                const height = asNumber(target.height);
                if (width === null || height === null || width <= 0 || height <= 0) continue;
                const body = asRecord(record.body);
                if (!body || readGroundControlPoints(body) === null) continue;

                const georeference: StorymapGeoreference = {
                    url,
                    width,
                    height,
                    body: body as unknown as StorymapGeoreference["body"],
                };
                const entry: StorymapOverlayLayer = { georeference };
                const attribution = formatAttribution(
                    readRequiredStatement(record.requiredStatement),
                );
                if (attribution !== "") entry.attribution = attribution;
                overlays.push(entry);
            }
        }
    }
    return overlays;
}
