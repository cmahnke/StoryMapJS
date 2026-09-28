/**
 * Types for scripts/convert-to-iiif.mjs.
 *
 * The converter is plain ESM JavaScript — a build-time tool, deliberately not
 * part of the published library — and it no longer holds the mapping itself:
 * that is `storymapToManifest()` in src/storymap/to-iiif.ts, which it imports
 * and re-exports. This declaration exists so the test that imports the wrapper
 * resolves the library's real types, and it is kept next to the script so the
 * two cannot drift apart unnoticed.
 */
export { storymapToManifest } from "../src/storymap/to-iiif";
export type {
    StorymapDocument,
    StorymapLanguageMap,
    StorymapManifest,
    StorymapManifestAnnotation,
    StorymapManifestBackground,
    StorymapManifestCanvas,
    StorymapManifestContentResource,
    StorymapManifestFeatureCollection,
    StorymapManifestGeoreferencing,
    StorymapManifestImageService,
    StorymapManifestRange,
    StorymapManifestService,
    StorymapManifestSpecificResource,
    StorymapManifestStatement,
} from "../src/storymap/to-iiif";
