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

/** One problem `validateStorymap()` reports. */
export type { StorymapError } from "./storymap/validate";

/** `loadCSS()`'s options (currently the abort signal). */
export type { LoadOptions } from "./core/Load";

/** The shape of a bundled locale file, as `setLanguage()` reads it. */
export type { LanguageEntry } from "./language/Language";

/**
 * A IIIF Content State 1.0 target: the canvas a deep link names, and the
 * region within it when the link carries one.
 */
export type { ContentState } from "./storymap/content-state";

/**
 * Public data and options types for constructing a StoryMap.
 *
 * The data types are exported rather than only referenced: they are what a host
 * actually types its document and options with, and TypeDoc warns about a
 * documented member whose type it cannot link.
 */
export type {
    StorymapSlide,
    StorymapSlideText,
    StorymapSlideMedia,
    StorymapSlideMarker,
    StorymapSlideNarration,
    StorymapSlideBackground,
    StorymapSlideLocation,
    StorymapData,
    StorymapDataWrapper,
    StorymapOptions,
    StorymapOverlayLayer,
    StorymapTilejson,
    StorymapGeoreference,
    StorymapGeoreferenceBody,
    StorymapGroundControlPoint,
    StorymapMapOptions,
    TileSourceFactory,
    LatLngLiteral,
    MediaTypeMatch,
    AnimationHandle,
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
    StorymapLanguageMap,
    StorymapManifestAnnotation,
    StorymapManifestBackground,
    StorymapManifestContentResource,
    StorymapManifestFeatureCollection,
    StorymapManifestGeoreferencing,
    StorymapManifestImageService,
    StorymapManifestRange,
    StorymapManifestSpecificResource,
    StorymapManifestStatement,
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

/**
 * What a listener receives: the event payload plus the framework's `type`
 * and `target` fields.
 */
export type { FiredEvent } from "./core/mixins";

/** The swipe directions a `Swipable` reports. */
export type { SwipeDirection } from "./ui/Swipable";

/**
 * Per-emitter event maps (`event name → payload`), for typed subscriptions:
 * `storymap.on("change", (e) => ...)` now infers `e` instead of `unknown`.
 *
 * @remarks Each map lists exactly the events its emitter fires.
 */
export type { StoryMapEvents } from "./storymap/StoryMap";
export type { StorySliderEvents } from "./slider/StorySlider";
export type { SlideEvents, SlideBackgroundState } from "./slider/Slide";
export type { SlideNavEvents } from "./slider/SlideNav";
export type { MediaEvents } from "./media/Media";
export type { TextEvents } from "./media/types/Text";
export type { MapEvents } from "./map/Map";
export type { MapMarkerEvents, MarkerEventPayload } from "./map/MapMarker";
export type { MenuBarEvents } from "./ui/MenuBar";
export type { MessageEvents } from "./ui/Message";
export type { SwipableEvents } from "./ui/Swipable";

/**
 * A map marker as returned by `storymap.getMarker(n)` / `getMarkers()` —
 * the handle for `openPopup()` / `closePopup()` / `popupOpen`.
 */
export type { default as StoryMapMarker } from "./map/openlayers/MapMarker.OpenLayers";

/**
 * Payload of the `imageready` event, fired when an image source is actually
 * attached — the only outward signal that the imagery is really on the map.
 */
export type { ImagereadyKind, ImagereadyPayload } from "./map/openlayers/Map.OpenLayers";
