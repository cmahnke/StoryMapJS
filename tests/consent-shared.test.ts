import { beforeEach, describe, expect, it } from "vitest";
import {
    ConsentManager,
    mediaService,
    tileService,
    type ConsentService,
} from "../src/storymap/Consent";

/**
 * Every viewer on a page shares one consent record, so a visitor answers a
 * given service once. That only holds if the managers stay in step: each one
 * used to write its whole decision set back to localStorage, so a decision
 * made in one viewer was erased by the next viewer to persist, and the two
 * then disagreed about the same service.
 */
describe("consent shared between viewers", () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.body.replaceChildren();
    });

    function stored(): Record<string, boolean> {
        const raw = window.localStorage.getItem("storymapjs-consent");
        return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    }

    /** Ask in a fresh container and answer through the rendered dialog. */
    async function ask(
        manager: ConsentManager,
        service: ConsentService,
        answer: boolean,
    ): Promise<boolean> {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const promise = manager.request(service, "example.com", container);
        container
            .querySelector<HTMLElement>(answer ? ".vco-consent-allow" : ".vco-consent-deny")
            ?.click();
        return promise;
    }

    /** Ask in a fresh container, asserting that no dialog was rendered. */
    function askWithoutDialog(manager: ConsentManager, service: ConsentService): Promise<boolean> {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const promise = manager.request(service, "example.com", container);
        expect(container.querySelector(".vco-consent")).toBeNull();
        return promise;
    }

    it("a sibling viewer's ask resolves from the shared record", async () => {
        const youtube = mediaService("youtube", "YouTube");
        const a = new ConsentManager();
        // a's viewer answers "deny" for YouTube
        expect(await ask(a, youtube, false)).toBe(false);

        // the other viewer, constructed before that decision, must not ask
        // the visitor the same question again
        const b = new ConsentManager();
        await expect(askWithoutDialog(b, youtube)).resolves.toBe(false);
        expect(b.isDenied(youtube.key)).toBe(true);
    });

    /** Ask in a fresh container; resolve with the promise and the panel. */
    function askAsync(
        manager: ConsentManager,
        service: ConsentService,
    ): { promise: Promise<boolean>; container: HTMLElement } {
        const container = document.createElement("div");
        document.body.appendChild(container);
        return { promise: manager.request(service, "example.com", container), container };
    }

    it("a decision in one viewer does not erase a sibling's", async () => {
        // Both viewers are open at once and both dialogs are on screen before
        // either is answered — the realistic SPA case, and the one that used
        // to lose data: each manager wrote its whole decision set back, so
        // whichever answered last dropped the other's service from storage.
        const vimeo = mediaService("vimeo", "Vimeo");
        const youtube = mediaService("youtube", "YouTube");
        const a = new ConsentManager();
        const b = new ConsentManager();

        const askA = askAsync(a, vimeo);
        const askB = askAsync(b, youtube);
        askA.container.querySelector<HTMLElement>(".vco-consent-allow")?.click();
        askB.container.querySelector<HTMLElement>(".vco-consent-deny")?.click();
        await Promise.all([askA.promise, askB.promise]);

        expect(stored()).toMatchObject({ [vimeo.key]: true, [youtube.key]: false });

        // Convergence is on the next ask, not retroactive: each manager still
        // holds only what it decided itself, and re-reads the shared record
        // when it next needs an answer.
        await expect(askWithoutDialog(a, youtube)).resolves.toBe(false);
        await expect(askWithoutDialog(b, vimeo)).resolves.toBe(true);
        expect(a.isDenied(youtube.key)).toBe(true);
        expect(b.isGranted(vimeo.key)).toBe(true);
    });

    it("both managers converge on the whole record", async () => {
        const tiles = tileService();
        const a = new ConsentManager();
        expect(await ask(a, tiles, true)).toBe(true);

        const b = new ConsentManager();
        await expect(askWithoutDialog(b, tiles)).resolves.toBe(true);
        expect(b.isGranted(tiles.key)).toBe(true);
    });

    it("a stale in-memory decision is corrected on the next ask", async () => {
        // This manager decides "deny" and holds it in memory. Something else
        // then changes the shared record (a third viewer, or another tab
        // writing the same key) — the ask must re-read rather than trust the
        // stale copy, or this viewer re-prompts for a settled service.
        const youtube = mediaService("youtube", "YouTube");
        const a = new ConsentManager();
        expect(await ask(a, youtube, false)).toBe(false);
        expect(a.isDenied(youtube.key)).toBe(true);

        window.localStorage.setItem("storymapjs-consent", JSON.stringify({ [youtube.key]: true }));

        // a denial already answered inside this viewer stays denied for the
        // promise that is still open, but the next ask sees the new record
        await expect(askWithoutDialog(a, youtube)).resolves.toBe(true);
        expect(a.isGranted(youtube.key)).toBe(true);
        expect(a.isDenied(youtube.key)).toBe(false);
    });

    it("will not contradict a sibling's answer for the same service", async () => {
        const youtube = mediaService("youtube", "YouTube");
        const a = new ConsentManager();
        const b = new ConsentManager();

        expect(await ask(a, youtube, false)).toBe(false);
        // b asks and is told "deny" from the record, so it must NOT open a
        // dialog offering to allow it
        const container = document.createElement("div");
        document.body.appendChild(container);
        await expect(b.request(youtube, "example.com", container)).resolves.toBe(false);
        expect(container.querySelector(".vco-consent")).toBeNull();
    });

    it("still works for a single viewer", async () => {
        const a = new ConsentManager();
        const only = mediaService("only", "Only");
        expect(await ask(a, only, true)).toBe(true);
        expect(stored()).toEqual({ [only.key]: true });
        expect(a.hasUnanswered([only.key])).toBe(false);
    });
});
