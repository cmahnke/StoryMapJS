import { beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Shared scaffolding for viewer tests (jsdom): every StoryMap construction
 * needs a `ResizeObserver` stand-in and a container div. Centralized so new
 * specs stop copy-pasting the stub.
 */
export function ensureTestDom(): void {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        if (typeof (globalThis as Record<string, unknown>).ResizeObserver === "undefined") {
            class ResizeObserverStub {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
            (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
        }
    });
}

/** Build a viewer on a fresh container: `options` simulates loader output. */
export function makeStorymap(
    id: string,
    storymap: Record<string, unknown>,
    options?: Record<string, unknown>,
): StoryMap {
    const el = document.createElement("div");
    el.id = id;
    document.body.appendChild(el);
    return new StoryMap(
        id,
        { storymap } as unknown as StorymapDataWrapper,
        options as Record<string, unknown> | undefined,
    );
}

/** Two text slides plus story-level option overrides. */
export function twoSlides(extra: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        slides: [{ text: { headline: "One", text: "" } }, { text: { headline: "Two", text: "" } }],
        ...extra,
    };
}

/** Read a JSON fixture relative to the repo root. */
export function loadFixture(path: string): unknown {
    return JSON.parse(readFileSync(join(process.cwd(), path), "utf8"));
}
