// Conversion of IIIF Presentation API 3.0 manifests into legacy StoryMapJS
// data, following the mapping proposed in docs/storymap-as-iiif-manifest.md.
//
// The converter is intentionally defensive: every property is read through
// narrowing helpers and malformed shapes are skipped, never thrown.

import type {
    StorymapData,
    StorymapSlide,
    StorymapSlideBackground,
    StorymapSlideLocation,
    StorymapSlideMedia,
} from "../types";

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

/** True when `data` looks like a Presentation API 3.0 manifest. */
export function isPresentation3Manifest(data: unknown): boolean {
    const record = asRecord(data);
    if (!record) return false;
    if (record.type === "Manifest") return true;
    const context = record["@context"];
    const candidates = Array.isArray(context) ? context : [context];
    return candidates.some(
        (entry) => typeof entry === "string" && entry.includes(PRESENTATION_3_CONTEXT),
    );
}

/**
 * Finds the manifest-level map configuration service (profile containing
 * "mapconfig") and returns its properties, or null when absent.
 */
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
 * Reads the slide media URL from the canvas's painting annotation body:
 * typed bodies contribute their `id`, TextualBody (HTML) content its `value`
 * - the legacy format stores both in `media.url`.
 */
function readPaintingBodyUrl(canvas: Record<string, unknown>): string | null {
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
            const url = readBodyUrl(annotationRecord.body);
            if (url !== null) return url;
        }
    }
    return null;
}

function readBodyUrl(body: unknown): string | null {
    if (Array.isArray(body)) {
        for (const entry of body) {
            const url = readBodyUrl(entry);
            if (url !== null) return url;
        }
        return null;
    }
    const record = asRecord(body);
    if (!record) return null;
    const id = asString(record.id);
    if (id !== null) return id;
    const value = asString(record.value);
    if (value !== null) return value;
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

function readBackground(value: unknown): StorymapSlideBackground | string | null {
    const record = asRecord(value);
    if (record) {
        const background: StorymapSlideBackground = {};
        const url = asString(record.url);
        const color = asString(record.color);
        if (url !== null) background.url = url;
        if (color !== null) background.color = color;
        // slide background opacity is accepted but never read by the viewer
        return Object.keys(background).length > 0 ? background : null;
    }
    if (typeof value === "string" && value !== "") {
        return value;
    }
    return null;
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

    // media: painting annotation body plus the caption/credit extension terms
    const mediaUrl = readPaintingBodyUrl(record);
    const caption = asString(readTerm(record, "mediaCaption"));
    const credit = asString(readTerm(record, "mediaCredit"));
    if (mediaUrl !== null || caption !== null || credit !== null) {
        const media: StorymapSlideMedia = {};
        if (mediaUrl !== null) media.url = mediaUrl;
        if (caption !== null) media.caption = caption;
        if (credit !== null) media.credit = credit;
        slide.media = media;
    }

    // location: canvas navPlace, falling back to a manifest-level navPlace
    // aggregated in items order (both are allowed by the proposal)
    const location = readLocation(record.navPlace) ?? readFeatureLocation(manifestFeature);
    if (location !== null) slide.location = location;

    // StoryMap extension terms
    const slideType = asString(record[STORYMAP_PREFIX + "type"]);
    if (slideType !== null) slide.type = slideType;
    const date = readTerm(record, "date");
    const dateString = asString(date);
    const dateRecord = asRecord(date);
    if (dateString !== null) slide.date = dateString;
    else if (dateRecord !== null) slide.date = dateRecord;
    const background = readBackground(readTerm(record, "background"));
    if (background !== null) slide.background = background;

    return slide;
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

    const title = flattenLanguageMap(record.label);
    if (title !== "") data.title = title;

    // Manifest-level map configuration service → storymap options fields.
    const config = readMapConfig(record);
    if (config) {
        applyMapConfig(data, config);
    }

    // requiredStatement → iiif.attribution
    const requiredStatement = asRecord(record.requiredStatement);
    const attribution = requiredStatement ? flattenLanguageMap(requiredStatement.value) : "";
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
        const slide = canvasToSlide(items[index], manifestFeatures[index]);
        if (slide !== null) data.slides.push(slide);
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

    const iiifUrl = asString(readTerm(config, "iiifUrl"));
    if (iiifUrl !== null) data.iiif = { url: iiifUrl, attribution: "" };

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
}
