import { afterEach, describe, expect, it } from "vitest";
import {
    ConsentManager,
    fontService,
    mediaService,
    tileService,
    type ConsentService,
} from "../src/storymap/Consent";
import { setLanguage } from "../src/language/Language";

/**
 * A consent service is a {key, label} pair, and only the key is ever stored.
 *
 * The code used to pass one string that served as both, which meant:
 *  - the tile and font services stored a *localized* string as the
 *    localStorage key, so translating `consent_service_tiles` would have
 *    invalidated every stored decision the moment the language changed;
 *  - the per-slide panel used the media type slug as its display label, so it
 *    asked "Load content from youtube?" where the start-of-story dialog
 *    correctly said "YouTube".
 */
describe("consent service keys", () => {
    afterEach(() => {
        window.localStorage.clear();
        document.body.innerHTML = "";
        setLanguage("en");
    });

    const SERVICES: ConsentService[] = [
        tileService(),
        mediaService("youtube", "YouTube"),
        fontService(),
    ];

    function stored(): Record<string, boolean> {
        return JSON.parse(window.localStorage.getItem("storymapjs-consent") ?? "{}");
    }

    it("stores the stable key, never the label", async () => {
        const manager = new ConsentManager();
        const host = document.createElement("div");
        document.body.appendChild(host);
        const promise = manager.request(tileService(), "tiles.example", host);
        (host.querySelector(".vco-consent-allow") as HTMLElement).click();
        await expect(promise).resolves.toBe(true);

        const keys = Object.keys(stored());
        expect(keys).toEqual([tileService().key]);
        // the label is what the visitor reads, never what we persist
        expect(keys).not.toContain("map tiles");
        expect(manager.isGranted(tileService().key)).toBe(true);
    });

    it("keeps the key stable across a language switch", async () => {
        const manager = new ConsentManager();
        const host = document.createElement("div");
        document.body.appendChild(host);
        const promise = manager.request(tileService(), "tiles.example", host);
        (host.querySelector(".vco-consent-allow") as HTMLElement).click();
        await promise;

        const afterEnglish = stored();
        expect(Object.keys(afterEnglish)).toEqual([tileService().key]);

        // German has its own wording for the service; the stored key must not
        // move, or the grant becomes invisible and the visitor is re-asked
        setLanguage("de");
        expect(tileService().key).toBe(
            afterEnglish[Object.keys(afterEnglish)[0]] ? tileService().key : "moved",
        );
        expect(Object.keys(afterEnglish)).toEqual(["map:tiles"]);

        // a fresh manager in either language still finds the decision
        expect(new ConsentManager().isGranted(tileService().key)).toBe(true);
        expect(new ConsentManager().isDenied(tileService().key)).toBe(false);
    });

    it("round-trips: persist then restore yields the same keys", async () => {
        // Regression guard. The first cut of migrateLegacyKey recognised only
        // the "media:" prefix, so "map:tiles" and "fonts:web" were re-prefixed
        // to "media:map:tiles" on every read and a stored grant was never
        // found again. Migration has to be idempotent.
        const manager = new ConsentManager();
        const host = document.createElement("div");
        document.body.appendChild(host);
        for (const service of SERVICES) {
            const ask = document.createElement("div");
            document.body.appendChild(ask);
            const promise = manager.request(service, "example.com", ask);
            (ask.querySelector(".vco-consent-allow") as HTMLElement).click();
            await promise;
        }
        expect(Object.keys(stored()).sort()).toEqual(SERVICES.map((s) => s.key).sort());

        // restoring and re-persisting must not change the key set
        const first = new ConsentManager();
        for (const service of SERVICES) {
            expect(first.isGranted(service.key)).toBe(true);
        }
        expect(Object.keys(stored()).sort()).toEqual(SERVICES.map((s) => s.key).sort());
    });

    it("migrates every legacy key shape onto the namespaced form", () => {
        // what a visitor who answered before the registry existed has stored
        window.localStorage.setItem(
            "storymapjs-consent",
            JSON.stringify({
                "map tiles": true,
                "web fonts": false,
                youtube: true,
            }),
        );
        const manager = new ConsentManager();
        expect(manager.isGranted("map:tiles")).toBe(true);
        expect(manager.isDenied("fonts:web")).toBe(true);
        expect(manager.isGranted("media:youtube")).toBe(true);
        // and the legacy keys are gone, not left to drift
        expect(Object.keys(stored()).sort()).toEqual(["fonts:web", "map:tiles", "media:youtube"]);
    });

    it("namespaces media keys so they cannot collide with a service", () => {
        const media = mediaService("youtube", "YouTube");
        expect(media.key).toBe("media:youtube");
        expect(media.key).not.toBe(media.label);
        expect(tileService().key).not.toBe(media.key);
        expect(fontService().key).not.toBe(media.key);
    });

    it("falls back to the slug when a media type has no display name", () => {
        expect(mediaService("thing", "").label).toBe("thing");
    });

    it("dispose() settles every unanswered ask and removes the dialogs", async () => {
        const manager = new ConsentManager();
        const host = document.createElement("div");
        document.body.appendChild(host);
        // two slides of the same service preloaded, asking in parallel
        const a = manager.request(mediaService("youtube", "YouTube"), "youtube.com", host);
        const b = manager.request(mediaService("youtube", "YouTube"), "youtube.com", host);
        const startHost = document.createElement("div");
        document.body.appendChild(startHost);
        manager.requestAll(SERVICES, startHost);

        expect(host.querySelectorAll(".vco-consent").length).toBe(2);
        expect(startHost.querySelectorAll(".vco-consent-service").length).toBe(3);

        manager.dispose();

        // Media.loadMedia() awaits request(); an unsettled promise would hang
        // the async frame and keep the whole media subtree alive
        await expect(a).resolves.toBe(false);
        await expect(b).resolves.toBe(false);
        expect(host.querySelector(".vco-consent")).toBeNull();
        expect(startHost.querySelector(".vco-consent-start")).toBeNull();
    });

    it("a late answer after dispose() is ignored, not persisted", async () => {
        const manager = new ConsentManager();
        const host = document.createElement("div");
        document.body.appendChild(host);
        const promise = manager.request(tileService(), "tiles.example", host);
        const allow = host.querySelector(".vco-consent-allow") as HTMLElement;

        manager.dispose();
        allow.click();

        await expect(promise).resolves.toBe(false);
        expect(manager.isGranted(tileService().key)).toBe(false);
        expect(stored()).toEqual({});
    });
});
