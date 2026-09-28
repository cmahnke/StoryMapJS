/**
 * StoryMapJS — interactive maps that tell stories.
 *
 * @packageDocumentation
 */
import "./scss/VCO.StoryMap.scss";

/**
 * The interactive StoryMap viewer component.
 *
 * @see {@link StoryMap.constructor} for the constructor signature.
 */
export { StoryMap } from "./storymap/StoryMap";

/**
 * Append a stylesheet `<link>` to the document head.
 *
 * @param href - The stylesheet URL.
 * @param options - Optional AbortSignal to cancel an in-flight load.
 * @returns Resolves once the stylesheet has loaded, rejects on error or abort.
 */
export { loadCSS } from "./core/Load";

/**
 * Resolve the media type (YouTube, Vimeo, image, ...) for a media URL.
 */
export { default as MediaType } from "./media/MediaType";

/**
 * Switch the UI language at runtime.
 *
 * @param language - Locale code matching a locale file (e.g. `"en"`, `"es"`).
 */
export { setLanguage } from "./language/Language";

/**
 * Validate a storymap document against the bundled JSON Schema.
 *
 * @param data - The storymap document to validate.
 * @returns The list of validation error messages (empty when valid).
 */
export { validateStorymap, validateStorymapAndReport } from "./storymap/validate";

/**
 * Public data and options types for constructing a StoryMap.
 */
export type {
    StorymapSlide,
    StorymapDataWrapper,
    StorymapOptions,
    StorymapOverlayLayer,
    StorymapMapOptions,
    StorymapSlideLocation,
    TileSourceFactory,
    LatLngLiteral,
} from "./types";

/**
 * True when a fetched document is an IIIF Presentation 3 manifest (accepted
 * directly as a StoryMap source).
 */
export {
    isPresentation3Manifest,
    isPresentation3Collection,
    manifestToStorymapData,
} from "./storymap/iiif";

/**
 * Convert a legacy storymap document into a IIIF Presentation 3 manifest —
 * the writer counterpart of `manifestToStorymapData()`. Pure, so the same
 * document always produces the same manifest.
 */
export { storymapToManifest } from "./storymap/to-iiif";

/**
 * The manifest shape `storymapToManifest()` produces, for a host that wants to
 * consume or further annotate the result.
 */
export type {
    StorymapDocument,
    StorymapManifest,
    StorymapManifestCanvas,
    StorymapManifestService,
} from "./storymap/to-iiif";

/**
 * Re-exported OpenLayers types, so consumers can type the map reachable at
 * `storymap.map` without depending on `ol` themselves.
 */
export type { default as OlMap } from "ol/Map";
export type { default as OlView } from "ol/View";
export type { default as OlLayer } from "ol/layer/Layer";
export type { default as OlTileLayer } from "ol/layer/Tile";
export type { default as OlVectorLayer } from "ol/layer/Vector";
export type { default as OlSource } from "ol/source/Source";
export type { default as OlProjection } from "ol/proj/Projection";
