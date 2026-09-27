import { afterEach, describe, expect, it, vi } from "vitest";
import {
    ConsentManager,
    mediaService,
    tileService,
    type ConsentService,
} from "../src/storymap/Consent";

/**
 * Consent decisions persist in localStorage (no cookies): the state
 * round-trips across manager instances, malformed data is ignored, and an
 * unavailable storage backend must not break the manager.
 */
describe("consent localStorage persistence", () => {
    afterEach(() => {
        try {
            window.localStorage.clear();
        } catch {
            // the stub replaced localStorage with a throwing backend
        }
        vi.unstubAllGlobals();
    });

    it("persists decisions across manager instances", async () => {
        const youtube = mediaService("youtube", "YouTube");
        const first = new ConsentManager();
        expect(await awaitDecision(first, youtube, () => true)).toBe(true);
        expect(first.isGranted(youtube.key)).toBe(true);

        // a fresh manager (e.g. after a reload) restores the decision
        const second = new ConsentManager();
        expect(second.isGranted(youtube.key)).toBe(true);
        expect(second.isDenied(tileService().key)).toBe(false);
    });

    it("persists denied services and restores them", async () => {
        const tiles = tileService();
        const first = new ConsentManager();
        expect(await awaitDecision(first, tiles, () => false)).toBe(false);
        const second = new ConsentManager();
        expect(second.isDenied(tiles.key)).toBe(true);
        expect(second.isGranted(tiles.key)).toBe(false);
    });

    it("ignores malformed stored data", () => {
        window.localStorage.setItem("storymapjs-consent", "{not json");
        expect(() => new ConsentManager()).not.toThrow();
        const manager = new ConsentManager();
        expect(manager.isGranted("YouTube")).toBe(false);
        expect(manager.isDenied("YouTube")).toBe(false);
    });

    it("survives an unavailable storage backend", async () => {
        vi.stubGlobal("localStorage", {
            getItem: () => {
                throw new Error("SecurityError");
            },
            setItem: () => {
                throw new Error("SecurityError");
            },
        });
        expect(() => new ConsentManager()).not.toThrow();
        const manager = new ConsentManager();
        await expect(
            awaitDecision(manager, mediaService("youtube", "YouTube"), () => true),
        ).resolves.toBe(true);
    });
});

/** Drive one consent ask through the DOM and answer it. */
async function awaitDecision(
    manager: ConsentManager,
    service: ConsentService,
    answer: () => boolean,
): Promise<boolean> {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const promise = manager.request(service, "example.com", container);
    const button = container.querySelector<HTMLElement>(
        answer() ? ".vco-consent-allow" : ".vco-consent-deny",
    );
    button?.click();
    return promise;
}
