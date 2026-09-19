// Shared types for the map classes (src/map).

import type { StorymapSlideLocation } from "../types";

/** Members injected at runtime via classMixin(..., Events). */
export interface Evented {
    fire: (type: string, data?: unknown, target?: unknown) => unknown;
    on: (type: string, fn: unknown, context?: unknown) => unknown;
    off?: (type: string, fn?: unknown, context?: unknown) => unknown;
    hasEventListeners: (type: string) => boolean;
}

/** Options accepted by viewTo/_viewTo. */
export interface ViewToOptions {
    calculate_zoom?: boolean;
    duration?: number;
    zoom?: number;
}

/** A point of the connection line: either a slide or a raw lat/lon pair. */
export interface LinePoint {
    location?: StorymapSlideLocation;
    lat?: number;
    lon?: number;
}
