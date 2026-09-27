// Conversion of IIIF Presentation API 3.0 manifests into legacy StoryMapJS
// data, following the mapping proposed in docs/storymap-as-iiif-manifest.md.
//
// The converter is intentionally defensive: every property is read through
// narrowing helpers and malformed shapes are skipped, never thrown.

import type {
    StorymapData,
    StorymapGeoreference,
    StorymapOverlayLayer,
    StorymapSlide,
    StorymapSlideBackground,
    StorymapSlideLocation,
    StorymapSlideMedia,
} from "../types";
import { readGroundControlPoints } from "../map/georeference";

const PRESENTATION_3_CONTEXT = "iiif.io/api/presentation/3/context.json";
const MAPCONFIG_PROFILE = "mapconfig";
const STORYMAP_PREFIX = "storymap:";

/** Keys copied verbatim from navPlace Feature properties onto the location. */
const LOCATION_PROPERTIES = [
    "name",
    "zoom",
    "line",
    "icon",
    "iconSize",
    "image",
    "use_custom_marker",
    // marker presentation with no IIIF vocabulary of its own: a GeoJSON
    // foreign member needs no registration, which is why these live here
    // rather than in a storymap: term (docs/plans/iiif-media-tours.md §2)
    "popup",
    "audioBadge",
] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return null;
    }
    return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
    return typeof value === "string" && value !== "" ? value : null;
}

function asNumber(value: unknown): number | null {
    return typeof value === "number" && !isNaN(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
    return typeof value === "boolean" ? value : null;
}

function asStringArray(value: unknown): string[] {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) {
        return value.filter((entry): entry is string => typeof entry === "string");
    }
    return [];
}

/**
 * Reads a IIIF xywh image region (`storymap:imageRegion`): an array of
 * exactly 4 finite numbers ([x, y, w, h] in image pixels). Returns null
 * for anything else — invalid regions are ignored.
 */
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
 * locations and no warning. `within`-style Collections are now handled by
 * {@link collectionToStorymapData}, and anything else is rejected here.
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
                thumbnail: asString(asRecord(body.thumbnail)?.id) ?? null,
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

function canvasToSlide(canvas: unknown, manifestFeature: unknown): StorymapSlide | null {
    const record = asRecord(canvas);
    if (!record) return null;

    const slide: StorymapSlide = {};

    // text: Canvas label → headline, Canvas summary → body text
    const headline = flattenLanguageMap(record.label);
    const text = flattenLanguageMap(record.summary);
    if (headline !== "" || text !== "") {
        slide.text = {};
        if (headline !== "") slide.text.headline = headline;
        if (text !== "") slide.text.text = text;
    }

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
    if (
        painting !== null ||
        caption !== null ||
        credit !== null ||
        alt !== null ||
        srcset !== null ||
        sizes !== null
    ) {
        const media: StorymapSlideMedia = {};
        if (painting !== null) media.url = painting.url;
        if (caption !== null) media.caption = caption;
        if (credit !== null) media.credit = credit;
        if (alt !== null) media.alt = alt;
        if (srcset !== null) media.srcset = srcset;
        if (sizes !== null) media.sizes = sizes;
        if (painting?.thumbnail != null) media.thumb = painting.thumbnail;
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
                        ...(asString(asRecord(body.thumbnail)?.id) !== null
                            ? { thumb: asString(asRecord(body.thumbnail)?.id) as string }
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

    // requiredStatement → iiif.attribution, label included (§2.1)
    const attribution = formatAttribution(readRequiredStatement(record.requiredStatement));
    if (attribution !== "") {
        const iiif = (data.iiif as { url?: string; attribution?: string } | undefined) ?? {};
        iiif.attribution = attribution;
        if (iiif.url === undefined) iiif.url = "";
        data.iiif = iiif;
    }

    // items[] (Canvases) → slides[], in order
    const items = Array.isArray(record.items) ? record.items : [];
    const manifestNavPlace = asRecord(record.navPlace);
    const manifestFeatures =
        manifestNavPlace && Array.isArray(manifestNavPlace.features)
            ? manifestNavPlace.features
            : [];
    for (let index = 0; index < items.length; index++) {
        // The canvas index, not the output-slide index: annotation stops
        // appended below shift the slide array, and the manifest-level
        // navPlace features line up with canvases.
        const canvasId = asString(asRecord(items[index])?.id);
        const slide = canvasToSlide(items[index], manifestFeatures[index]);
        if (slide !== null) {
            slide.uniqueid = canvasId ?? manifestId ?? "";
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
    const mapType = asString(readTerm(config, "mapType"));
    if (mapType !== null && mapType !== "") data.map_type = mapType;

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

    const mapSubdomains = asString(readTerm(config, "mapSubdomains"));
    if (mapSubdomains !== null) data.map_subdomains = mapSubdomains;

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

    const lessBounce = asBoolean(readTerm(config, "lessBounce"));
    if (lessBounce !== null) data.less_bounce = lessBounce;

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
    if (!Array.isArray(value) || value.length !== 4) return null;
    if (!value.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
    const [west, south, east, north] = value as number[];
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
