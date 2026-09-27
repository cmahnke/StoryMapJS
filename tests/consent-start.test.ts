import { afterEach, describe, expect, it } from "vitest";
import {
    ConsentManager,
    fontService,
    mediaService,
    tileService,
    type ConsentService,
} from "../src/storymap/Consent";

/**
 * Start-of-story consent: one dialog lists every external service with
 * per-service Allow/Deny plus global "Allow all" / "Decline all".
 * Decisions persist and resolve pending slide asks; the dialog is not
 * shown when every service already has a stored decision.
 */
describe("start-of-story consent dialog", () => {
    afterEach(() => {
        window.localStorage.clear();
        document.body.innerHTML = "";
    });

    const SERVICES: ConsentService[] = [
        tileService(),
        mediaService("youtube", "YouTube"),
        fontService(),
    ];

    function open(): { manager: ConsentManager; container: HTMLElement } {
        const manager = new ConsentManager();
        const container = document.createElement("div");
        document.body.appendChild(container);
        manager.requestAll(SERVICES, container);
        return { manager, container };
    }

    it("renders a service list with global actions", () => {
        const { container } = open();
        const dialog = container.querySelector(".vco-consent-start");
        expect(dialog).not.toBeNull();
        expect(container.querySelectorAll(".vco-consent-service")).toHaveLength(3);
        expect(
            container.querySelector(".vco-consent-start-actions .vco-consent-allow")?.textContent,
        ).toBe("Allow all");
        expect(
            container.querySelector(".vco-consent-start-actions .vco-consent-deny")?.textContent,
        ).toBe("Decline all");
    });

    it("allow all grants every service and closes the dialog", () => {
        const { manager, container } = open();
        (
            container.querySelector(".vco-consent-start-actions .vco-consent-allow") as HTMLElement
        ).click();
        expect(container.querySelector(".vco-consent-start")).toBeNull();
        for (const s of SERVICES) {
            expect(manager.isGranted(s.key)).toBe(true);
            expect(manager.isDenied(s.key)).toBe(false);
        }
        // decisions persist
        const second = new ConsentManager();
        for (const s of SERVICES) {
            expect(second.isGranted(s.key)).toBe(true);
        }
    });

    it("decline all denies every service", () => {
        const { manager, container } = open();
        (
            container.querySelector(".vco-consent-start-actions .vco-consent-deny") as HTMLElement
        ).click();
        expect(container.querySelector(".vco-consent-start")).toBeNull();
        for (const s of SERVICES) {
            expect(manager.isDenied(s.key)).toBe(true);
        }
    });

    it("individual choices close the dialog only when all are answered", () => {
        const { manager, container } = open();
        // answer the first two services individually
        const rows = container.querySelectorAll(".vco-consent-service");
        (rows[0].querySelector(".vco-consent-allow") as HTMLElement).click();
        (rows[1].querySelector(".vco-consent-deny") as HTMLElement).click();
        // one service remains unanswered: the dialog stays
        expect(container.querySelector(".vco-consent-start")).not.toBeNull();
        expect(manager.isGranted(tileService().key)).toBe(true);
        expect(manager.isDenied(mediaService("youtube", "YouTube").key)).toBe(true);
        expect(manager.isGranted(fontService().key)).toBe(false);

        // answering the last one closes the dialog
        (rows[2].querySelector(".vco-consent-allow") as HTMLElement).click();
        expect(container.querySelector(".vco-consent-start")).toBeNull();
        expect(manager.isGranted(fontService().key)).toBe(true);
    });

    it("resolves pending slide asks when the service is allowed", async () => {
        const { manager, container } = open();
        // a slide ask pending in parallel
        const slideAsk = document.createElement("div");
        document.body.appendChild(slideAsk);
        const promise = manager.request(
            mediaService("youtube", "YouTube"),
            "youtube.com",
            slideAsk,
        );

        // allow all resolves it
        (
            container.querySelector(".vco-consent-start-actions .vco-consent-allow") as HTMLElement
        ).click();
        await expect(promise).resolves.toBe(true);
        expect(slideAsk.querySelector(".vco-consent")).toBeNull();
    });

    it("is not shown when every service has a stored decision", () => {
        const seeded = new ConsentManager();
        for (const s of SERVICES) {
            // simulate stored grants via a request + allow
            const c = document.createElement("div");
            document.body.appendChild(c);
            void seeded.request(s, "", c).then(() => {});
            (c.querySelector(".vco-consent-allow") as HTMLElement).click();
        }
        // a fresh manager with the same services: nothing unanswered
        const manager = new ConsentManager();
        const container = document.createElement("div");
        document.body.appendChild(container);
        manager.requestAll(SERVICES, container);
        expect(container.querySelector(".vco-consent-start")).toBeNull();
    });
});
