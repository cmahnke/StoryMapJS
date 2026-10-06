// Conversion of legacy StoryMapJS documents into IIIF Presentation API 3.0
// manifests, following the mapping proposed in
// docs/storymap-as-iiif-manifest.md.
//
// This is the writer half of the format. `manifestToStorymapData()` in
// ./iiif.ts is the reader half, and the two are the only places that know the
// mapping — scripts/convert-to-iiif.mjs used to hold the writer and now only
// does the file I/O around this function.
//
// Pure by design: no `node:fs`, no DOM, no fetch, no module state. A caller
// reads a document however it likes, calls storymapToManifest() and serialises
// the result, which is what the CLI does for public/examples-iiif/.
import type {
    StorymapData,
    StorymapGeoreference,
    StorymapGeoreferenceBody,
    StorymapOverlayLayer,
    StorymapSlide,
    StorymapSlideLocation,
} from "../types";
// Explicit `.ts` extension: scripts/convert-to-iiif.mjs imports this module
// straight into node --experimental-strip-types, whose ESM resolution does
// not try extensions. Extensionless (repo style) breaks `npm run convert:iiif`
// and tests/convert-cli.test.ts catches it.
import {
    LOCATION_PROPERTIES,
    asRecord,
    isHttpUrl,
    isLonLatBox,
    languageMap,
} from "./iiif-shared.ts";

/**
 * The document {@link storymapToManifest} reads: the `{ "storymap": {...} }`
 * wrapper a `storymap.json` file is, with every member optional.
 *
 * The root is `Partial<StorymapData>` — every legacy key is optional and the
 * files in the wild carry more than the schema documents — or a plain record,
 * which is what a document read straight out of `JSON.parse` is. The wrapper
 * itself is open, because the legacy files also carry a root-level `font_css`
 * and the map configuration service prefers it over the key inside `storymap`.
 */
export interface StorymapDocument {
    storymap?: Partial<StorymapData> | Record<string, unknown>;
    [key: string]: unknown;
}

/** A IIIF Presentation 3 language map; only the neutral `none` tag is written. */
export interface StorymapLanguageMap {
    none: string[];
}

/** A `{label, value}` pair — the P3 shape for a caption, credit or rights line. */
export interface StorymapManifestStatement {
    label: StorymapLanguageMap;
    value: StorymapLanguageMap;
}

/** A IIIF Image API service reference. */
export interface StorymapManifestImageService {
    id: string;
    type: string;
    profile: string;
}

/**
 * A content resource: a painting body, a thumbnail or a background.
 *
 * One permissive interface rather than a discriminated union, because the
 * emitter only writes these: the shapes it produces are the classified media
 * body, a IIIF `Image`, a `TextualBody` and a `Color`, and they are
 * distinguished by `type` for the reader, not for us.
 */
export interface StorymapManifestContentResource {
    id?: string;
    type: string;
    format?: string;
    width?: number;
    height?: number;
    value?: string;
    service?: StorymapManifestImageService[];
}

/** A navPlace FeatureCollection: a point for a location, a Polygon for a bbox. */
export interface StorymapManifestFeatureCollection {
    id: string;
    type: "FeatureCollection";
    features: {
        id: string;
        type: "Feature";
        geometry: {
            type: string;
            coordinates: number[] | number[][] | number[][][];
        };
        /** Marker presentation, described by navplace-properties.json (§3.3). */
        properties: Record<string, unknown>;
    }[];
}

/** A painting annotation: the slide's own media, painted onto its canvas. */
export interface StorymapManifestAnnotation {
    id: string;
    type: "Annotation";
    motivation: string;
    /** The media caption, as the annotation's own `label` (§2.7). */
    label?: StorymapLanguageMap;
    /** The media credit (§2.7). P3 allows a single object, not an array. */
    requiredStatement?: StorymapManifestStatement;
    /** The media alt text (§2.7). */
    accessibilitySummary?: StorymapLanguageMap;
    body: StorymapManifestContentResource;
    target: string | StorymapManifestSpecificResource;
    /** Playback flags (slideshow audio terms); foreign members, absent when unset. */
    "storymap:loop"?: boolean;
    "storymap:offset"?: number;
    "storymap:play"?: string;
    "storymap:stopOnExit"?: boolean;
    "storymap:stopAllPrevious"?: boolean;
}

/** A painting annotation whose target is a region of a larger image (§2.8). */
export interface StorymapManifestSpecificResource {
    type: "SpecificResource";
    source: string;
    selector: { type: "ImageApiSelector"; value: string };
}

/** A Georeference Extension annotation for a placed raster (§2.10). */
export interface StorymapManifestGeoreferencing {
    id: string;
    type: "Annotation";
    motivation: "georeferencing";
    target: {
        id: string;
        type: "Image";
        width: number;
        height: number;
        service: StorymapManifestImageService[];
    };
    requiredStatement?: StorymapManifestStatement;
    body: StorymapGeoreferenceBody;
}

/** A canvas `background`: a painting annotation of the slide's backdrop (§2.6). */
export interface StorymapManifestBackground {
    id: string;
    type: "Annotation";
    motivation: "painting";
    body: StorymapManifestContentResource | StorymapManifestContentResource[];
    target: string;
}

/** One P3 `Range` over the canvases of a `slide.group` (§3.5). */
export interface StorymapManifestRange {
    id: string;
    type: "Range";
    label: StorymapLanguageMap;
    items: string[];
}

export interface StorymapManifestCanvas {
    id: string;
    type: "Canvas";
    width: number;
    height: number;
    /** The slide's date, which P3 constrains to a plain string (§2.5). */
    navDate?: string;
    background?: StorymapManifestBackground;
    thumbnail?: StorymapManifestContentResource[];
    items: {
        id: string;
        type: "AnnotationPage";
        items: (StorymapManifestAnnotation | StorymapManifestGeoreferencing)[];
    }[];
    label?: StorymapLanguageMap;
    summary?: StorymapLanguageMap;
    /** An overview slide, which the map's `overview` type carries (§2.4). */
    "storymap:type"?: string;
    "storymap:mediaSrcset"?: unknown;
    "storymap:mediaSizes"?: unknown;
    /** View directives (slideshow rotation/basemap/filter/mask); navPlace carries them when lat/lon exist. */
    "storymap:rotation"?: number;
    "storymap:basemap"?: string;
    "storymap:filter"?: unknown;
    "storymap:mask"?: unknown;
    /** Per-slide autoplay dwell (slideshow slidetimeout) and image overlay. */
    "storymap:slidetimeout"?: number;
    "storymap:imgoverlay"?: unknown;
    /** Provenance identifiers (slideshow manifest/canvas/image ids). */
    "storymap:provenance"?: unknown;
    navPlace?: StorymapManifestFeatureCollection;
}

/**
 * The map configuration service entry, keyed by the `storymap:` terms.
 *
 * Open by necessity: the official validator's Manifest schema is
 * `additionalProperties: false`, which is exactly why the map configuration
 * travels on a service of its own rather than on the Manifest (§3.1).
 */
export interface StorymapManifestService {
    id: string;
    type: "Service";
    profile: string;
    [term: string]: unknown;
}

export interface StorymapManifest {
    "@context": string[];
    id: string;
    type: "Manifest";
    label: StorymapLanguageMap;
    behavior: string[];
    metadata: { label: StorymapLanguageMap; value: StorymapLanguageMap }[];
    items: StorymapManifestCanvas[];
    structures?: StorymapManifestRange[];
    navPlace?: StorymapManifestFeatureCollection;
    service?: StorymapManifestService[];
    requiredStatement?: StorymapManifestStatement;
}

// The original zoomify tile paths of the legacy fixtures are dead, so image-map
// storymaps are rewritten to the IIIF reference image used by the repo's IIIF
// fixtures. The original zoomify definition is preserved as a storymap: term.
const LAOCOON_ID =
    "https://iiif.io/api/image/3.0/example/reference/28473c77da3deebe4375c3a50572d9d3-laocoon";
const LAOCOON_INFO = `${LAOCOON_ID}/info.json`;
const LAOCOON_IMAGE = `${LAOCOON_ID}/full/max/0/default.jpg`;
const LAOCOON_WIDTH = 2315;
const LAOCOON_HEIGHT = 3000;

const STORYMAP_CONTEXT = "https://cmahnke.github.io/StoryMapJS/context.json";
// The navPlace extension's linked data context **must be included before** the
// Presentation 3 context (navplace §3.1), and every fixture here carries a
// navPlace, so the order is not negotiable. The two StoryMapJS contexts follow:
// the properties one describes the terms inside the navPlace Feature bag, which
// §3.2 allows only via "a registered IIIF API extension or a local linked data
// context" — there is no extension for marker presentation, so it is local.
// Frozen, and copied per manifest below: this array used to be handed out by
// reference, so a host mutating one manifest's @context corrupted every later
// call in the process.
const CONTEXTS: readonly string[] = Object.freeze([
    "http://iiif.io/api/extension/navplace/context.json",
    "http://iiif.io/api/presentation/3/context.json",
    `${STORYMAP_CONTEXT.replace(/context\.json$/, "")}navplace-properties.json`,
    STORYMAP_CONTEXT,
]);

const IMAGE_FORMATS: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    avif: "image/avif",
};

const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com", "dailymotion.com", "vine.co"];
const SOUND_HOSTS = ["soundcloud.com"];

function classifyMediaUrl(url: string): { type: string; format?: string } {
    const ext = url.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
    // Own-property check: a bare lookup hits Object.prototype, so a URL
    // ending in `.constructor` (or `.__proto__`) classifies as an Image.
    if (ext && Object.hasOwn(IMAGE_FORMATS, ext)) {
        return { type: "Image", format: IMAGE_FORMATS[ext] };
    }
    let host: string;
    try {
        host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return { type: "Text", format: "text/html" };
    }
    if (VIDEO_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
        return { type: "Video" };
    }
    if (SOUND_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
        return { type: "Sound" };
    }
    // Page-embedded media (tweets, Wikipedia, photo pages, ...) - the viewer
    // decides how to render these; the manifest carries a typed reference.
    return { type: "Text", format: "text/html" };
}

/**
 * A value worth writing: neither absent nor the empty string. A type guard, so
 * a declared `string | null` member narrows to the string it is.
 */
function present<T>(value: T | null | undefined): value is T {
    return value !== undefined && value !== null && value !== "";
}

/** An array of `T`, or an empty one. */
function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Convert a legacy storymap document to a IIIF Presentation 3.0 manifest.
 *
 * The counterpart of `manifestToStorymapData()`: what that reads, this writes.
 * Nothing but the input is read, so the same document always produces the same
 * manifest — which is what makes regenerating `public/examples-iiif/` a no-op.
 *
 * @param name - The manifest's label, and the stem of its canonical id.
 * @param legacy - The `storymap.json` document (`{ "storymap": {...} }`).
 * @returns The manifest, ready to serialise.
 */
export function storymapToManifest(name: string, legacy: StorymapDocument): StorymapManifest {
    // The legacy root is open, so the declaration says "a record" where a real
    // document is a `Partial<StorymapData>`; the two are the same thing at
    // runtime and every field below is read the way the reader reads one.
    const storymap = (legacy.storymap ?? {}) as Partial<StorymapData>;
    // A hand-built document can carry anything in this array. A non-object
    // has no text, no media and no location, so it is skipped rather than
    // painted as an empty canvas — or crashing on `slide.text`.
    const slides = asArray<StorymapSlide>(storymap.slides).filter(
        (slide): slide is StorymapSlide => asRecord(slide) !== null,
    );
    const isZoomify = storymap.map_type === "zoomify";
    const isImageMap = isZoomify || storymap.map_type === "iiif";
    const manifestId = `https://example.org/storymap/${name}`;
    // The root-level legacy fields are untyped JSON — `StorymapData` has an open
    // index signature — so the attribution is carried verbatim rather than
    // narrowed, exactly as the writer in scripts/convert-to-iiif.mjs did.
    const iiif = asRecord(storymap.iiif);
    const zoomify = asRecord(storymap.zoomify);
    const attribution = (iiif?.attribution || zoomify?.attribution || "") as string;

    const canvases = slides.map((slide, i) =>
        buildCanvas(manifestId, i, slide, isImageMap, i === 0 ? asArray(storymap.overlays) : []),
    );

    const manifest: StorymapManifest = {
        "@context": [...CONTEXTS],
        id: manifestId,
        type: "Manifest",
        label: languageMap(name),
        behavior: ["paged"],
        // P3's `provider` is whoever *published* the content, and the
        // converter does not know that — it only knows what produced the
        // manifest, which is what `metadata` is for. Claiming to be the
        // provider would put "Provider: StoryMapJS" on the credit line of every
        // converted storymap (§3.2).
        metadata: [
            {
                label: languageMap("Generated by"),
                value: languageMap("StoryMapJS"),
            },
        ],
        items: canvases,
    };
    // Story credit (slideshow `creator`/`rights`): structured metadata
    // entries, which the reader keeps in `data.metadata`. The dedicated
    // `provider`/`rights` slots stay untouched — provider names the
    // publisher, which the converter does not know (§3.2).
    const credit = storymap.credit;
    if (credit && typeof credit.creator === "string" && credit.creator !== "") {
        manifest.metadata.push({
            label: languageMap("Creator"),
            value: languageMap(credit.creator),
        });
    }
    if (credit && typeof credit.rights === "string" && credit.rights !== "") {
        manifest.metadata.push({
            label: languageMap("Rights"),
            value: languageMap(credit.rights),
        });
    }

    // `structures` carries the groups (§3.5). A storymap states a slide's
    // group as a plain string; P3 states it as a Range over the canvases it
    // contains, and the reader turns that back into `slide.group`.
    const structures = buildStructures(manifestId, slides, canvases);
    if (structures) manifest.structures = structures;

    // A map bbox has no extension term: the interoperable spelling is a
    // navPlace Polygon, which the reader turns back into map_bbox
    // (readNavPlaceBbox). Without this the extent was silently lost on the
    // round trip.
    const bbox = storymap.map_bbox;
    if (isLonLatBox(bbox)) {
        const [west, south, east, north] = bbox;
        manifest.navPlace = {
            id: `${manifestId}/navplace`,
            type: "FeatureCollection",
            features: [
                {
                    id: `${manifestId}/navplace/feature/1`,
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [west, south],
                                [east, south],
                                [east, north],
                                [west, north],
                                [west, south],
                            ],
                        ],
                    },
                    properties: {},
                },
            ],
        };
    }

    const config = buildMapConfig(storymap, legacy, isZoomify);
    if (Object.keys(config).length > 0) {
        // The Manifest object is closed for extension terms in the official
        // validator's JSON Schema (see docs "Validator interop"), so the
        // storymap map configuration travels on a dedicated service entry.
        manifest.service = [
            {
                id: `${manifestId}/map-config`,
                type: "Service",
                profile: `${STORYMAP_CONTEXT}/mapconfig`,
                ...config,
            },
        ];
    }
    if (present(attribution)) {
        manifest.requiredStatement = {
            label: languageMap("Attribution"),
            value: languageMap(attribution),
        };
    }
    return manifest;
}

function buildMapConfig(
    storymap: Partial<StorymapData>,
    legacy: StorymapDocument,
    isZoomify: boolean,
): Record<string, unknown> {
    const config: Record<string, unknown> = {};
    let mapType = storymap.map_type;
    if (isZoomify) {
        // zoomify support was replaced by the IIIF Image API; the legacy
        // pyramid definition is not carried (nothing reads it)
        mapType = "iiif";
        config["storymap:mapAsImage"] = true;
    }
    if (present(mapType)) {
        // A keyword basemap and a tile URL template are different kinds of
        // thing, and `mapType` used to be both. A keyword the viewer knows how
        // to configure is a `storymap:basemap`; anything with a {z} in it is
        // TileJSON's `tiles`, which is where a tile service belongs (§2.9).
        // The check coerces but the write must too: a non-string map_type
        // would otherwise land verbatim in a slot the reader types as string.
        const mapTypeString = String(mapType);
        if (mapTypeString.includes("{z}")) {
            config.tilejson = { tiles: mapTypeString };
        } else {
            config["storymap:basemap"] = mapTypeString;
        }
    }
    if (storymap.map_as_image !== undefined) {
        config["storymap:mapAsImage"] = storymap.map_as_image;
    }
    if (present(storymap.map_access_token)) {
        config["storymap:mapAccessToken"] = storymap.map_access_token;
    }
    if (present(storymap.map_background_color)) {
        config["storymap:mapBackgroundColor"] = storymap.map_background_color;
    }
    if (storymap.map_center_offset !== undefined) {
        config["storymap:mapCenterOffset"] = storymap.map_center_offset;
    }
    // false is meaningful (no injected theme) and must survive the legacy
    // fallback; everything else keeps the previous `||` semantics.
    const fontCss: unknown =
        legacy.font_css === false || storymap.font_css === false
            ? false
            : legacy.font_css || storymap.font_css;
    if (present(fontCss)) {
        config["storymap:fontCss"] = fontCss;
    }
    if (storymap.call_to_action !== undefined) {
        config["storymap:callToAction"] = storymap.call_to_action;
    }
    if (present(storymap.call_to_action_text)) {
        config["storymap:callToActionText"] = storymap.call_to_action_text;
    }
    if (storymap.start_at_slide !== undefined) {
        config["storymap:startAtSlide"] = storymap.start_at_slide;
    }
    if (present(storymap.language)) {
        config["storymap:language"] = storymap.language;
    }
    if (storymap.calculate_zoom !== undefined) {
        config["storymap:calculateZoom"] = storymap.calculate_zoom;
    }
    if (storymap.line_follows_path !== undefined) {
        config["storymap:lineFollowsPath"] = storymap.line_follows_path;
    }
    if (storymap.show_lines !== undefined) {
        config["storymap:showLines"] = storymap.show_lines;
    }
    if (storymap.show_history_line !== undefined) {
        config["storymap:showHistoryLine"] = storymap.show_history_line;
    }
    if (present(storymap.line_color)) {
        config["storymap:lineColor"] = storymap.line_color;
    }
    if (present(storymap.line_color_inactive)) {
        config["storymap:lineColorInactive"] = storymap.line_color_inactive;
    }
    if (storymap.line_weight !== undefined) {
        config["storymap:lineWeight"] = storymap.line_weight;
    }
    if (storymap.line_opacity !== undefined) {
        config["storymap:lineOpacity"] = storymap.line_opacity;
    }
    if (present(storymap.line_dash)) {
        config["storymap:lineDash"] = storymap.line_dash;
    }
    if (present(storymap.line_join)) {
        config["storymap:lineJoin"] = storymap.line_join;
    }
    if (storymap.use_custom_markers !== undefined) {
        config["storymap:useCustomMarkers"] = storymap.use_custom_markers;
    }
    if (storymap.map_area !== undefined) {
        config["storymap:mapArea"] = storymap.map_area;
    }
    if (isLonLatBox(storymap.overview_extent)) {
        config["storymap:overviewExtent"] = storymap.overview_extent;
    }
    if (storymap.keyboard !== undefined) {
        config["storymap:keyboard"] = storymap.keyboard;
    }
    const overlays = asArray<StorymapOverlayLayer>(storymap.overlays);
    if (overlays.length > 0) {
        // entries without a map_type are dropped on the way back in; an
        // entry carrying both map_type and georeference keeps only the
        // former here, because the georeference is also emitted as an
        // annotation — and the reader would otherwise return two overlays
        // for one source layer.
        config["storymap:overlays"] = overlays
            .filter((entry) => entry && present(entry.map_type))
            .map((entry) => {
                if (!entry.georeference) {
                    return entry;
                }
                const { georeference: _dropped, ...rest } = entry;
                return rest;
            });
    }
    return config;
}

function buildCanvas(
    manifestId: string,
    index: number,
    slide: StorymapSlide,
    isImageMap: boolean,
    georeferencedLayers: StorymapOverlayLayer[],
): StorymapManifestCanvas {
    const canvasId = `${manifestId}/canvas/${index + 1}`;
    const headline = slide.text?.headline || "";
    const bodyText = slide.text?.text || "";
    const width = isImageMap ? LAOCOON_WIDTH : 1080;
    const height = isImageMap ? LAOCOON_HEIGHT : 1080;

    const canvas: StorymapManifestCanvas = {
        id: canvasId,
        type: "Canvas",
        height,
        width,
        // P3 spells a slide's date `navDate`, and the official validator
        // constrains it to a plain string — a language map is rejected, and it
        // applies no format constraint at all, so the storymap value is
        // carried verbatim ("Aug 23" and "1790-2010" both pass) (§2.5)
        ...(typeof slide.date === "string" && slide.date !== "" ? { navDate: slide.date } : {}),
        // P3 paints a canvas background with an Annotation referenced from the
        // canvas `background` property (§2.6)
        ...buildBackground(canvasId, slide.background),
        // media.thumb is P3's `thumbnail`, a list of content resources (§3.1)
        ...buildThumbnail(slide),
        items: [
            {
                id: `${canvasId}/annotationpage/1`,
                type: "AnnotationPage",
                items: [
                    {
                        id: `${canvasId}/annotation/1`,
                        type: "Annotation",
                        motivation: "painting",
                        // P3 defines label / requiredStatement /
                        // accessibilitySummary on the Annotation, which is
                        // where a caption, a credit and alt text belong for
                        // the resource being painted (§2.7)
                        ...buildAnnotationPresentation(slide),
                        body: buildBody(slide, isImageMap),
                        target: buildRegionTarget(canvasId, slide.location?.region) ?? canvasId,
                        // Playback flags for audio/video media (slideshow
                        // audio terms); absent stays absent.
                        ...buildPlaybackTerms(slide.media ?? {}),
                    },
                    // Narration is a supplementing Sound body (V1 of #358):
                    // "additional to the painting", with no rendering rules
                    // attached — exactly what the dedicated audio element
                    // plays. Skipped when it duplicates the painting URL.
                    ...buildNarration(canvasId, slide),
                    // Extra visible media as further painting annotations (V2
                    // of #358): IIIF expresses multiple media per canvas as
                    // multiple paintings. The layout (media_layout) has no
                    // term and stays viewer-side.
                    ...buildExtraPaintings(canvasId, slide),
                    // Georeference Extension annotations for the placed rasters
                    // (§2.10). The layers are map-wide but an annotation is
                    // canvas-scoped, so they are written on the first canvas and
                    // the reader collects them from every canvas.
                    ...buildGeoreferencing(canvasId, georeferencedLayers),
                ],
            },
        ],
    };
    if (present(headline)) {
        canvas.label = languageMap(headline);
    }
    if (present(bodyText)) {
        canvas.summary = languageMap(bodyText);
    }

    const storymapTerms = buildCanvasTerms(slide);
    Object.assign(canvas, storymapTerms);

    const navPlace = buildNavPlace(canvasId, slide);
    if (navPlace) {
        canvas.navPlace = navPlace;
    }
    return canvas;
}

/**
 * A slide's extra visible media as further `painting` annotations (V2 of
 * #358). Each extra reuses the primary's body and presentation builders, so
 * captions, credits and alt text travel the same way; extras without a usable
 * url are skipped, matching the viewer.
 */
function buildExtraPaintings(canvasId: string, slide: StorymapSlide): StorymapManifestAnnotation[] {
    const extras = Array.isArray(slide.media_extra) ? slide.media_extra : [];
    return extras
        .filter((item) => typeof item?.url === "string" && item.url !== "")
        .map((item, index) => ({
            id: `${canvasId}/annotation/extra-${index + 1}`,
            type: "Annotation",
            motivation: "painting",
            ...buildAnnotationPresentation({ media: item }),
            body: buildBody({ media: item }, false),
            target: canvasId,
        }));
}

/**
 * A slide narration as a `motivation: "supplementing"` annotation (V1 of
 * #358). The body is always a `Sound`: narration plays through the
 * dedicated audio element, which never renders video.
 */
function buildNarration(canvasId: string, slide: StorymapSlide): StorymapManifestAnnotation[] {
    const url = slide.narration?.url;
    if (typeof url !== "string" || url === "" || url === slide.media?.url) {
        return [];
    }
    return [
        {
            id: `${canvasId}/annotation/narration`,
            type: "Annotation",
            motivation: "supplementing",
            body: { id: url, type: "Sound" },
            target: canvasId,
            ...buildPlaybackTerms(slide.narration ?? {}),
        },
    ];
}

/**
 * A map's georeferenced rasters as Georeference Extension annotations
 * (§2.10).
 *
 * Per the extension, a layer that is not part of the canvas it ships in — which
 * is every placed raster — carries the image it places in `target` as an
 * embedded resource, and the ground control points in `body` as a
 * FeatureCollection whose features carry `resourceCoords`.
 *
 * The `opacity`, `visible`, `className` and `blendMode` the term could carry
 * have no IIIF vocabulary for a georeferencing annotation, so they are not
 * written; the attribution is, as a `requiredStatement`, which is where P3 puts
 * it.
 */
function hasGeoreference(
    entry: StorymapOverlayLayer,
): entry is StorymapOverlayLayer & { georeference: StorymapGeoreference } {
    // Truthiness alone lets a string width or an Infinity height reach the
    // annotation target, which declares them as numbers — on the one branch
    // the validator whitelists out. Mirror the reader's shape check.
    if (!entry || !entry.georeference) {
        return false;
    }
    const { url, width, height } = entry.georeference as {
        url?: unknown;
        width?: unknown;
        height?: unknown;
    };
    return (
        typeof url === "string" &&
        url !== "" &&
        typeof width === "number" &&
        typeof height === "number" &&
        Number.isFinite(width) &&
        Number.isFinite(height) &&
        width > 0 &&
        height > 0
    );
}

function buildGeoreferencing(
    canvasId: string,
    overlays: StorymapOverlayLayer[],
): StorymapManifestGeoreferencing[] {
    const layers = overlays.filter(hasGeoreference);
    return layers.map((entry) => {
        const georeference = entry.georeference;
        return {
            // The index comes from `indexOf` rather than the map's own counter
            // because that is what the script emitted: two entries that are the
            // *same object* share an id. `JSON.parse` never produces that, so
            // the two agree on every real document — the quirk is preserved
            // rather than silently changed by the move into the library.
            id: `${canvasId}/georeferencing/${layers.indexOf(entry) + 1}`,
            type: "Annotation",
            motivation: "georeferencing",
            target: {
                id: georeference.url,
                type: "Image",
                width: georeference.width,
                height: georeference.height,
                service: [{ id: georeference.url, type: "ImageService3", profile: "level2" }],
            },
            ...(present(entry.attribution)
                ? {
                      requiredStatement: {
                          label: languageMap("Attribution"),
                          value: languageMap(entry.attribution),
                      },
                  }
                : {}),
            body: georeference.body,
        };
    });
}

/**
 * A storymap's `slide.group` values as P3 `structures`: one Range per group,
 * over the canvases it contains (§3.5).
 *
 * Groups come out in first-appearance order, and the slides keep their order
 * within a group — which is what makes a grouped storymap's slide order the
 * concatenation of its groups, rather than the original interleaving. No group
 * anywhere means no `structures` at all.
 */
function buildStructures(
    manifestId: string,
    slides: StorymapSlide[],
    canvases: StorymapManifestCanvas[],
): StorymapManifestRange[] | null {
    const groups: string[] = [];
    const byGroup = new Map<string, string[]>();
    slides.forEach((slide, i) => {
        const group = slide.group;
        if (!present(group)) return;
        if (!byGroup.has(group)) {
            byGroup.set(group, []);
            groups.push(group);
        }
        byGroup.get(group)?.push(canvases[i].id);
    });
    if (groups.length === 0) return null;
    return groups.map((group, i) => ({
        id: `${manifestId}/range/${i + 1}`,
        type: "Range",
        label: languageMap(group),
        items: byGroup.get(group) ?? [],
    }));
}

/**
 * A slide's `media.thumb` as P3's canvas `thumbnail`, which is a list of
 * content resources (§3.1).
 */
function buildThumbnail(slide: StorymapSlide): Partial<StorymapManifestCanvas> {
    const url = slide.media?.thumb;
    if (!present(url) || typeof url !== "string") return {};
    const { type, format } = classifyMediaUrl(url);
    return { thumbnail: [{ id: url, type, ...(format ? { format } : {}) }] };
}

/**
 * A slide background as P3's canvas `background`: a painting Annotation whose
 * body is the image and/or the colour to paint behind the slide (§2.6). A
 * bare-string background is a colour, as it has always been in storymap-JSON.
 *
 * `background.opacity` is deliberately not carried across. IIIF has no
 * vocabulary for it — Presentation 3 has a `Color` body but nothing to fade a
 * background with, and 4.0's `backgroundColor` is a plain hex value — and the
 * viewer never rendered it, so a term for it would be dead vocabulary.
 */
function buildBackground(
    canvasId: string,
    background: StorymapSlide["background"],
): Partial<StorymapManifestCanvas> {
    if (!background) return {};
    const object = typeof background === "object" ? background : {};
    const url = typeof background === "string" ? null : object.url;
    const color = typeof background === "string" ? background : object.color;
    const bodies: StorymapManifestContentResource[] = [];
    if (present(url)) {
        if (typeof url === "string") {
            const { type, format } = classifyMediaUrl(url);
            bodies.push({ id: url, type, ...(format ? { format } : {}) });
        }
    }
    if (present(color) && typeof color === "string") {
        bodies.push({ type: "Color", value: color });
    }
    if (bodies.length === 0) return {};
    return {
        background: {
            id: `${canvasId}/background`,
            type: "Annotation",
            motivation: "painting",
            body: bodies.length === 1 ? (bodies[0] as StorymapManifestContentResource) : bodies,
            target: canvasId,
        },
    };
}

/**
 * A slide's media caption, credit and alt text as the painting annotation's
 * own P3 properties, replacing the `storymap:mediaCaption` /
 * `mediaCredit` / `mediaAlt` canvas terms (§2.7).
 *
 * `requiredStatement` is a single `{label, value}` object in P3 — the official
 * validator rejects the array form — so the credit becomes a labelled
 * statement, and §2.1's reader turns it back into "Credit: …".
 */
function buildAnnotationPresentation(slide: StorymapSlide): Partial<StorymapManifestAnnotation> {
    const out: Partial<StorymapManifestAnnotation> = {};
    if (present(slide.media?.caption) && typeof slide.media?.caption === "string") {
        out.label = languageMap(slide.media.caption);
    }
    if (present(slide.media?.credit) && typeof slide.media?.credit === "string") {
        out.requiredStatement = {
            label: languageMap("Credit"),
            value: languageMap(slide.media.credit),
        };
    }
    if (present(slide.media?.alt) && typeof slide.media?.alt === "string") {
        out.accessibilitySummary = languageMap(slide.media.alt);
    }
    return out;
}

function buildBody(slide: StorymapSlide, isImageMap: boolean): StorymapManifestContentResource {
    if (isImageMap) {
        // Image-map canvas: paint the IIIF Image API resource. The service
        // reference lets IIIF-aware viewers request arbitrary resolutions.
        return {
            id: LAOCOON_IMAGE,
            type: "Image",
            format: "image/jpeg",
            width: LAOCOON_WIDTH,
            height: LAOCOON_HEIGHT,
            service: [{ id: LAOCOON_INFO, type: "ImageService3", profile: "level2" }],
        };
    }
    const url = slide.media?.url;
    if (isHttpUrl(url)) {
        const { type, format } = classifyMediaUrl(url);
        const body: StorymapManifestContentResource = { id: url, type };
        if (format) {
            body.format = format;
        }
        return body;
    }
    // A media block with a wrong-typed url is not a text-only slide: painting
    // the caption here would claim it IS the content (and the summary already
    // carries it, so the reader would read it back as media.url). Emit an
    // empty body instead of a plausible lie. An empty string is not
    // wrong-typed — it is the idiomatic "no media" marker — so it keeps the
    // old path, as does a missing url.
    if (url !== undefined && url !== null && url !== "" && typeof url !== "string") {
        return { type: "TextualBody", format: "text/html", value: "" };
    }
    // Text-only slide (or a media value that is not a URL): paint the HTML.
    const html = typeof url === "string" && url !== "" ? url : slide.text?.text || "";
    return {
        type: "TextualBody",
        format: "text/html",
        value: html,
    };
}

function buildCanvasTerms(slide: StorymapSlide): Partial<StorymapManifestCanvas> {
    const terms: Partial<StorymapManifestCanvas> = {};
    if (slide.type === "overview") {
        terms["storymap:type"] = "overview";
    }
    if (present(slide.media?.srcset)) {
        terms["storymap:mediaSrcset"] = slide.media?.srcset;
    }
    if (present(slide.media?.sizes)) {
        terms["storymap:mediaSizes"] = slide.media?.sizes;
    }
    // View directives that also ride the navPlace properties (which only
    // exist when the slide has lat/lon): the canvas terms are the fallback
    // for image-region-only slides, and the reader prefers navPlace.
    if (typeof slide.location?.rotation === "number") {
        terms["storymap:rotation"] = slide.location.rotation;
    }
    if (present(slide.location?.basemap) && typeof slide.location?.basemap === "string") {
        terms["storymap:basemap"] = slide.location.basemap;
    }
    if (present(slide.location?.filter)) {
        terms["storymap:filter"] = slide.location?.filter;
    }
    if (present(slide.location?.mask)) {
        terms["storymap:mask"] = slide.location?.mask;
    }
    if (typeof slide.slidetimeout === "number") {
        terms["storymap:slidetimeout"] = slide.slidetimeout;
    }
    if (present(slide.imgoverlay)) {
        terms["storymap:imgoverlay"] = slide.imgoverlay;
    }
    if (present(slide.provenance)) {
        terms["storymap:provenance"] = slide.provenance;
    }
    return terms;
}

/**
 * `storymap:` playback flags for a media/narration bag (slideshow audio
 * terms): foreign members needing no vocabulary registration. Only present
 * flags are written, so old readers see an unchanged annotation.
 */
function buildPlaybackTerms(bag: {
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
 * A slide's `location.region` as the painting annotation's target, so the
 * region is an Image API selector rather than a term (§2.8).
 *
 * `xywh=pixel:` rather than a bare `xywh=` because the field is documented in
 * image pixels, and the prefix then says so itself instead of implying the
 * canvas size — which matters for a non-image map, where the canvas is a
 * nominal 1080×1080 and the region's image is something else entirely. It is
 * the prefix Media Fragments 1.0 defines for source-image pixels; `image:` is
 * not one of the three it defines.
 */
function buildRegionTarget(
    canvasId: string,
    region: StorymapSlideLocation["region"],
): StorymapManifestSpecificResource | null {
    if (!Array.isArray(region) || region.length !== 4) return null;
    if (!region.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
    return {
        type: "SpecificResource",
        source: canvasId,
        selector: { type: "ImageApiSelector", value: `xywh=pixel:${region.join(",")}` },
    };
}

function buildNavPlace(
    canvasId: string,
    slide: StorymapSlide,
): StorymapManifestFeatureCollection | null {
    const location = slide.location || {};
    // typeof narrows for the compiler, isFinite for the runtime: a typeof
    // check alone lets Infinity through, which serialises as null — invalid
    // GeoJSON the reader then drops silently. Same guard as the bbox and
    // region paths.
    const { lat, lon } = location;
    if (
        typeof lat !== "number" ||
        typeof lon !== "number" ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ) {
        return null;
    }
    const properties: Record<string, unknown> = {};
    for (const key of LOCATION_PROPERTIES) {
        if (present(location[key])) {
            properties[key] = location[key];
        }
    }
    return {
        id: `${canvasId}/navplace`,
        type: "FeatureCollection",
        features: [
            {
                id: `${canvasId}/navplace/feature/1`,
                type: "Feature",
                geometry: { type: "Point", coordinates: [lon, lat] },
                properties,
            },
        ],
    };
}
