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
} from "./types";
