// Shared types for the map classes (src/map).

import type { StorymapSlideLocation } from "../types";

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
