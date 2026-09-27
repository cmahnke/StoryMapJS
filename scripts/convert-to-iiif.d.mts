/**
 * Types for scripts/convert-to-iiif.mjs.
 *
 * The converter is plain ESM JavaScript — a build-time tool, deliberately not
 * part of the published library — but tests/iiif-roundtrip.test.ts imports its
 * mapping function in-process, so it needs a declaration. Kept next to the
 * script so the two cannot drift apart unnoticed.
 */
export declare function storymapToManifest(
    name: string,
    legacy: { storymap?: Record<string, unknown> },
): Record<string, unknown>;
