/**
 * Translation of slideshow tours (W3C `AnnotationCollection` + the
 * `strollview` extension) into storymap data.
 *
 * Pure, no I/O/DOM/fetch: paging beyond the first page arrives via
 * `opts.extraPages` (the CLI and the viewer follow `next` links), so the
 * same document always produces the same story. Reuses the shared
 * narrowing helpers; the core features it targets (rotation, filter/mask,
 * per-slide basemaps, narration bags, player chrome) all render only with
 * `slideshow_source`, so translator output is unaffected by the internal
 * gate and internal documents never take this path (see the detector).
 */

import type {
    StorymapData,
    StorymapSlide,
    StorymapSlideFilter,
    StorymapSlideMask,
    StorymapSlideNarration,
} from "../types";
import { asNumber, asRecord, asString, asStringArray, clampRegion } from "./iiif-shared.ts";
import { isStaticImageUrl } from "../map/slideView.ts";

/** The embed `settings` JSON (string → web component), all fields optional. */
export interface SlideshowPlayerSettings {
    uri?: unknown;
    mode?: unknown;
    viewerheight?: unknown;
    autoplay?: unknown;
    slidetimeout?: unknown;
    fxmode?: unknown;
    shownav?: unknown;
    showfullscreen?: unknown;
    showinfo?: unknown;
    showscrollbars?: unknown;
    progressbar?: unknown;
    textmode?: unknown;
    textsize?: unknown;
    imgoverlay?: unknown;
    imgoverlayurl?: unknown;
    imgoverlaysize?: unknown;
    showheadings?: unknown;
    bgcolor?: unknown;
    hudbgcolor?: unknown;
    hudcolor?: unknown;
    hudopacity?: unknown;
    [key: string]: unknown;
}

export interface SlideshowWarning {
    kind: string;
    count: number;
    sampleIds: string[];
    detail: string;
}

export interface SlideshowToStorymapResult {
    data: StorymapData;
    warnings: SlideshowWarning[];
}

export interface SlideshowTranslatorOptions {
    /** Parsed embed settings; option keys land on the storymap object. */
    settings?: SlideshowPlayerSettings | null;
    /**
     * Following `AnnotationPage`s for `first.next` chains (fetched by the
     * caller: CLI and viewer). Items append in order.
     */
    extraPages?: unknown[];
}

/** Maximum `next` pages consumed (collect + warn when truncated). */
const MAX_EXTRA_PAGES = 20;
/** Sample ids kept per warning kind (counts are exact regardless). */
const MAX_WARNING_SAMPLES = 5;

const STROLLVIEW_CONTEXT = "strollview/2/context.jsonld";
const V1_CONTEXT = "ns/iiif.jsonld";
const P3_CONTEXT = "iiif.io/api/presentation/3/context.json";

function contextsOf(doc: Record<string, unknown>): string[] {
    const raw = doc["@context"];
    const list = Array.isArray(raw) ? raw : [raw];
    return list.filter((entry): entry is string => typeof entry === "string");
}

/** 2 for the `strollview` extension, 1 for the legacy context, else 0. */
export function slideshowVersion(doc: unknown): 0 | 1 | 2 {
    const record = asRecord(doc);
    if (!record) return 0;
    const contexts = contextsOf(record);
    if (contexts.some((c) => c.includes(STROLLVIEW_CONTEXT))) return 2;
    if (contexts.some((c) => c.includes(V1_CONTEXT))) return 1;
    return 0;
}

/**
 * True for a slideshow tour document: an `AnnotationCollection` that is
 * neither Presentation 3 (Manifest/Collection) nor a plain annotation page,
 * carrying slideshow markers (extension context, or items shaped like
 * slideshow annotations). Narrow by conjunction so P3 `seeAlso`
 * collections never match.
 */
export function isSlideshowCollection(doc: unknown): boolean {
    const record = asRecord(doc);
    if (!record) return false;
    if (record.type !== "AnnotationCollection") return false;
    const contexts = contextsOf(record);
    if (contexts.some((c) => c.includes(P3_CONTEXT))) return false;
    if (slideshowVersion(doc) !== 0) return true;
    const first = asRecord(record.first);
    const items = first && Array.isArray(first.items) ? first.items : [];
    const head = asRecord(items[0]);
    if (!head) return false;
    if (asRecord(head.strollview) !== null) return true;
    const target = asRecord(head.target);
    const targetId = target ? asString(target.id) : null;
    return targetId !== null && /#([^,]+),([^,]+),([^,]+),([^,]+)\s*$/.test(targetId);
}

/** A language map (or plain string) reduced to one string, `none` first. */
function flattenLabel(value: unknown): string {
    if (typeof value === "string") return value;
    const record = asRecord(value);
    if (!record) return "";
    if (typeof record.value === "string") return record.value;
    const none = record.none;
    if (typeof none === "string" && none !== "") return none;
    const fromNone = asStringArray(none).join(" ").trim();
    if (fromNone !== "") return fromNone;
    for (const key of Object.keys(record)) {
        const text = asStringArray(record[key]).join(" ").trim();
        if (text !== "") return text;
    }
    return "";
}

/** Escape the five markup characters for `text/plain` bodies. */
function escapeText(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

class Warnings {
    private map = new Map<string, { count: number; sampleIds: string[]; detail: string }>();

    add(kind: string, sampleId: string | null, detail: string): void {
        const entry = this.map.get(kind) ?? { count: 0, sampleIds: [], detail };
        entry.count += 1;
        if (sampleId !== null && entry.sampleIds.length < MAX_WARNING_SAMPLES) {
            entry.sampleIds.push(sampleId);
        }
        this.map.set(kind, entry);
    }

    list(): SlideshowWarning[] {
        return [...this.map.entries()].map(([kind, entry]) => ({ kind, ...entry }));
    }
}

/** Split a canvas target id into its base and an `x,y,w,h` fragment. */
function splitTarget(target: unknown): {
    canvas: string | null;
    region: [number, number, number, number] | null;
    raw: boolean;
} {
    const record = asRecord(target);
    const id = record ? asString(record.id) : asString(target);
    if (id === null) return { canvas: null, region: null, raw: false };
    const hash = id.indexOf("#");
    if (hash === -1) return { canvas: id, region: null, raw: false };
    const parts = id
        .slice(hash + 1)
        .split(",")
        .map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
        const [x, y, w, h] = parts;
        if (w > 0 && h > 0) {
            // canvas dimensions are unknown to the pure translator, so this
            // is the origin-only clamp; fully-outside regions become null
            return {
                canvas: id.slice(0, hash),
                region: clampRegion([x, y, w, h], null, null),
                raw: true,
            };
        }
    }
    return { canvas: id.slice(0, hash), region: null, raw: true };
}

function readFilter(value: unknown): StorymapSlideFilter | null {
    const record = asRecord(value);
    if (!record) return null;
    const filter: StorymapSlideFilter = {};
    const percent = (key: string, min: number, max: number) => {
        const n = record[key];
        if (typeof n === "number" && Number.isFinite(n)) {
            filter[key] = Math.min(max, Math.max(min, n));
        }
    };
    percent("brightness", 0, 200);
    percent("contrast", 0, 200);
    percent("saturate", 0, 200);
    percent("sepia", 0, 100);
    const hue = record["hue_rotate"];
    if (typeof hue === "number" && Number.isFinite(hue)) {
        filter.hueRotate = Math.min(180, Math.max(-180, hue));
    }
    const blur = record["blur"];
    if (typeof blur === "number" && Number.isFinite(blur)) {
        filter.blur = Math.min(20, Math.max(0, blur));
    }
    return Object.keys(filter).length > 0 ? filter : null;
}

function readMask(value: unknown, color: unknown, invert: unknown): StorymapSlideMask | null {
    const record = asRecord(value);
    if (!record) return null;
    const { x, y, w, h } = record;
    if (
        typeof x !== "number" ||
        typeof y !== "number" ||
        typeof w !== "number" ||
        typeof h !== "number" ||
        ![x, y, w, h].every(Number.isFinite)
    ) {
        return null;
    }
    const mask: StorymapSlideMask = { x, y, w, h };
    // normalized at render (see normalizeMask); keep author values verbatim
    if (typeof color === "string" && color !== "") mask.color = color;
    if (invert === true) mask.invert = true;
    return mask;
}

function readAudio(
    value: unknown,
    warnings: Warnings,
    sampleId: string,
): StorymapSlideNarration | null {
    const record = asRecord(value);
    if (!record) return null;
    const url = asString(record.url);
    if (url === null) return null;
    const narration: StorymapSlideNarration = { url };
    if (typeof record.loop === "boolean") narration.loop = record.loop;
    const offset = record.offset;
    if (typeof offset === "number" && Number.isFinite(offset) && offset >= 0) {
        narration.offset = offset;
    }
    const play = record.play;
    if (play === "auto" || play === "click") {
        narration.play = play;
    } else if (play !== undefined) {
        warnings.add(
            "slideshow.audio-play",
            sampleId,
            `unknown audio.play ${String(play)}, kept auto`,
        );
        narration.play = "auto";
    }
    if (typeof record.stoponexit === "boolean") narration.stopOnExit = record.stoponexit;
    if (typeof record.stopallprevious === "boolean") {
        narration.stopAllPrevious = record.stopallprevious;
    }
    return narration;
}

/** A percent string or number as a 0..1 fraction, or null. */
function asFraction(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.min(1, Math.max(0.05, value > 1 ? value / 100 : value));
    }
    if (typeof value === "string") {
        const n = Number(value.replace("%", ""));
        if (Number.isFinite(n)) return Math.min(1, Math.max(0.05, n / 100));
    }
    return null;
}

/** A percent-ish value as 10..80, or null. */
function asPercent(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.min(80, Math.max(10, value));
    }
    if (typeof value === "string") {
        const n = Number(value.replace("%", ""));
        if (Number.isFinite(n)) return Math.min(80, Math.max(10, n));
    }
    return null;
}

/** A 0..100 opacity number, or null. */
function asOpacity(value: unknown): number | null {
    const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (!Number.isFinite(n)) return null;
    return Math.min(100, Math.max(0, n));
}

/** True for a `px`/`%`/`vh` viewer height, matching the schema pattern. */
function asViewerHeight(value: unknown): string | null {
    if (typeof value !== "string") return null;
    return /^[0-9]+(\.[0-9]+)?(px|%|vh)$/.test(value) ? value : null;
}

function applySettings(
    data: StorymapData,
    slides: StorymapSlide[],
    settings: SlideshowPlayerSettings | null | undefined,
    warnings: Warnings,
): void {
    if (!settings) return;
    const target = data as unknown as Record<string, unknown>;
    const mode = settings.mode;
    if (mode === "standard" || mode === "static") {
        target.mode = mode;
    } else if (mode !== undefined) {
        warnings.add("slideshow.mode", null, `unknown mode ${String(mode)}, kept standard`);
    }
    const viewerheight = asViewerHeight(settings.viewerheight);
    if (viewerheight !== null) {
        target.viewerheight = viewerheight;
    } else if (settings.viewerheight !== undefined) {
        warnings.add(
            "slideshow.viewerheight",
            null,
            `unparsable viewerheight ${String(settings.viewerheight)}, omitted`,
        );
    }
    if (settings.autoplay === true) {
        const timeout = asNumber(settings.slidetimeout);
        target.autoplay =
            timeout !== null && Number.isFinite(timeout) && timeout >= 0
                ? Math.round(timeout)
                : 6000;
        if (target.autoplay === 6000 && settings.slidetimeout !== undefined) {
            const raw = Number(settings.slidetimeout);
            if (!Number.isFinite(raw)) {
                warnings.add(
                    "slideshow.slidetimeout",
                    null,
                    `unparsable slidetimeout ${String(settings.slidetimeout)}, kept 6000`,
                );
            }
        }
    } else {
        target.autoplay = 0;
    }
    const fxmode = settings.fxmode;
    if (fxmode === "basic" || fxmode === undefined) {
        if (fxmode === "basic") target.fxmode = "slide";
    } else {
        warnings.add("slideshow.fxmode", null, `unknown fxmode ${String(fxmode)}, omitted`);
    }
    const progressbar = settings.progressbar;
    if (
        progressbar === "dots" ||
        progressbar === "squares" ||
        progressbar === "block" ||
        progressbar === "thinblock" ||
        progressbar === "bar"
    ) {
        target.progressbar = progressbar;
    } else if (progressbar === false || progressbar === "off") {
        target.progressbar = false;
    } else if (progressbar !== undefined) {
        warnings.add(
            "slideshow.progressbar",
            null,
            `unknown progressbar ${String(progressbar)}, omitted`,
        );
    }
    const textmode = settings.textmode;
    if (textmode === "left" || textmode === "right" || textmode === "bottom") {
        target.textmode = textmode;
        // side-dock textsize is dead in the player (a "20%"/2 NaN poisons
        // the calc, so the browser drops the declaration); only the bottom
        // marginBottom takes effect — map it to the panel height share
        if (textmode === "bottom") {
            const size = asPercent(settings.textsize);
            if (size !== null) {
                target.textsize = size;
            } else if (settings.textsize !== undefined) {
                warnings.add(
                    "slideshow.textsize",
                    null,
                    `unparsable textsize ${String(settings.textsize)}, omitted`,
                );
            }
        }
    } else if (textmode !== undefined) {
        warnings.add("slideshow.textmode", null, `unknown textmode ${String(textmode)}, omitted`);
    }
    if (typeof settings.hudcolor === "string" && settings.hudcolor !== "") {
        target.hudcolor = settings.hudcolor;
    }
    if (typeof settings.hudbgcolor === "string" && settings.hudbgcolor !== "") {
        target.hudbgcolor = settings.hudbgcolor;
    }
    const hudopacity = asOpacity(settings.hudopacity);
    if (hudopacity !== null) {
        target.hudopacity = hudopacity;
    } else if (settings.hudopacity !== undefined) {
        warnings.add(
            "slideshow.hudopacity",
            null,
            `unparsable hudopacity ${String(settings.hudopacity)}, omitted`,
        );
    }
    if (typeof settings.shownav === "boolean") target.shownav = settings.shownav;
    if (typeof settings.showfullscreen === "boolean") target.fullscreen = settings.showfullscreen;
    if (typeof settings.showinfo === "boolean") target.show_info = settings.showinfo;
    if (typeof settings.showscrollbars === "boolean") {
        target.show_scrollbars = settings.showscrollbars;
    }
    if (typeof settings.showheadings === "boolean") target.show_headings = settings.showheadings;
    if (typeof settings.bgcolor === "string" && settings.bgcolor !== "") {
        // approximation, documented: the single player background becomes
        // the map background
        target.map_background_color = settings.bgcolor;
    }
    // a player-global overlay fans out to every slide (documented); an
    // enabled overlay without a URL warns
    if (settings.imgoverlay === true) {
        const url = asString(settings.imgoverlayurl);
        if (url !== null) {
            const size = asFraction(settings.imgoverlaysize) ?? 0.5;
            for (const slide of slides) {
                slide.imgoverlay = { url, size };
            }
        } else {
            warnings.add("slideshow.imgoverlay", null, "imgoverlay enabled without a URL");
        }
    }
}

/**
 * Translate one slideshow tour document (plus any following pages) into
 * storymap data. Slideshow-only fields land verbatim; internal validation
 * (`validateStorymap`) must still pass on the result.
 */
export function slideshowToStorymapData(
    doc: unknown,
    opts: SlideshowTranslatorOptions = {},
): SlideshowToStorymapResult {
    const warnings = new Warnings();
    const record = asRecord(doc);
    const data: StorymapData = { slides: [] };
    if (!record) {
        warnings.add("slideshow.document", null, "not an object, no slides");
        return { data, warnings: warnings.list() };
    }
    const version = slideshowVersion(doc);
    if (version === 1) {
        warnings.add(
            "slideshow.version",
            null,
            "legacy v1 tours are detected but not mapped; no slides",
        );
        return { data, warnings: warnings.list() };
    }
    const docId = asString(record.id) ?? "";
    const label = flattenLabel(record.label);
    if (label !== "") {
        (data as unknown as Record<string, unknown>).title = label;
    }
    const creator = asString(record.creator);
    const rights = asString(record.rights);
    if (creator !== null || rights !== null) {
        data.credit = {
            ...(creator !== null ? { creator } : {}),
            ...(rights !== null ? { rights } : {}),
        };
    }
    const metadata = record.metadata;
    if (Array.isArray(metadata)) {
        (data as unknown as Record<string, unknown>).metadata = metadata.filter(
            (entry) => asRecord(entry) !== null,
        );
    }
    // page chain: the first page inline, the rest via opts (callers follow
    // `next` links: CLI and viewer, bounded)
    const pages: unknown[] = [];
    const first = asRecord(record.first);
    if (first) pages.push(first);
    for (const extra of opts.extraPages ?? []) {
        if (pages.length - 1 >= MAX_EXTRA_PAGES) break;
        pages.push(extra);
    }
    const nextLink = first ? asString(first.next) : null;
    if (nextLink !== null && (opts.extraPages ?? []).length === 0) {
        warnings.add(
            "slideshow.paging",
            null,
            `paged tour truncated after the first page (${nextLink})`,
        );
    }
    const items: unknown[] = [];
    for (const page of pages) {
        const pageRecord = asRecord(page);
        if (pageRecord && Array.isArray(pageRecord.items)) {
            items.push(...pageRecord.items);
        }
    }
    const slides: StorymapSlide[] = [];
    let fallbackUrl: string | null = null;
    const services: string[] = [];
    items.forEach((item, index) => {
        const sampleId = `annotation/${index}`;
        const annotation = asRecord(item);
        if (!annotation) {
            warnings.add("slideshow.annotation", sampleId, "not an object, skipped");
            return;
        }
        const slide: StorymapSlide = {};
        const annotationId =
            asString(annotation.id) ?? (docId !== "" ? `${docId}/annotation/${index}` : sampleId);
        slide.uniqueid = annotationId;
        const body = asRecord(annotation.body);
        const value = body ? (asString(body.value) ?? "") : "";
        const format = body ? asString(body.format) : null;
        const text =
            format !== null && /^text\/plain/i.test(format) && value.trim() !== ""
                ? `<p>${escapeText(value)}</p>`
                : value;
        slide.text = {
            ...(index === 0 && label !== "" ? { headline: label } : {}),
            ...(text !== "" ? { text } : {}),
        };
        const target = splitTarget(annotation.target);
        if (target.raw && target.region === null) {
            warnings.add(
                "slideshow.target",
                sampleId,
                "unparsable or fully-outside region, kept whole",
            );
        }
        const location: StorymapSlide["location"] = {};
        if (target.region !== null) location.region = target.region;
        const strollview = asRecord(annotation.strollview) ?? {};
        const rotation = asNumber(strollview.rotation);
        if (rotation !== null && rotation !== 0) location.rotation = rotation;
        const filter = readFilter(strollview.filters);
        if (filter !== null) location.filter = filter;
        const mask = readMask(
            strollview.passepartout,
            strollview.passepartout_color,
            strollview.passepartout_invert,
        );
        if (mask !== null) {
            location.mask = mask;
        } else if (strollview.passepartout !== undefined && strollview.passepartout !== false) {
            warnings.add("slideshow.passepartout", sampleId, "unusable shape, omitted");
        }
        const narration = readAudio(strollview.audio, warnings, sampleId);
        // only an image service (or static file) can back a basemap; a
        // manifest URL is provenance, never a tile source
        const service = asString(strollview.image_srv);
        if (service !== null) {
            location.basemap = service;
            services.push(service);
        }
        const provenance: Record<string, unknown> = {};
        for (const [key, source] of [
            ["manifest", strollview.manifest_id],
            ["canvas", strollview.canvas_id],
            ["image", strollview.image_id],
        ] as const) {
            const id = asString(source) ?? (key === "canvas" ? target.canvas : null);
            if (id !== null) provenance[key] = id;
        }
        if (Object.keys(provenance).length > 0) {
            slide.provenance = provenance as StorymapSlide["provenance"];
        }
        const imageStatic = asString(strollview.image_static);
        if (imageStatic !== null) {
            slide.media = { url: imageStatic };
            if (fallbackUrl === null) fallbackUrl = imageStatic;
        }
        if (Object.keys(location).length > 0) slide.location = location;
        if (narration !== null) {
            const mediaUrl = slide.media?.url;
            if (typeof mediaUrl === "string" && mediaUrl === narration.url) {
                warnings.add("slideshow.audio-dup", sampleId, "audio duplicates media, kept media");
            } else {
                slide.narration = narration;
            }
        }
        slides.push(slide);
    });
    data.slides = slides;
    data.map_type = "iiif";
    data.map_as_image = true;
    const iiif: { url: string; attribution: string; fallbackUrl?: string } = {
        url: "",
        attribution: "",
    };
    const firstService = services.length > 0 ? (services[0] as string) : null;
    if (firstService !== null && !isStaticImageUrl(firstService)) {
        iiif.url = firstService.endsWith("/info.json")
            ? firstService
            : `${firstService.replace(/\/$/, "")}/info.json`;
    }
    // a static first service (or none at all) leaves url empty: the story
    // renders from the fallback image once probed (slideshow tours only)
    if (fallbackUrl !== null) iiif.fallbackUrl = fallbackUrl;
    (data as unknown as Record<string, unknown>).iiif = iiif;
    applySettings(data, slides, opts.settings, warnings);
    return { data, warnings: warnings.list() };
}
