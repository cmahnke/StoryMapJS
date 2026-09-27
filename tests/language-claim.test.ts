import { afterEach, describe, expect, it } from "vitest";
import {
    claimLanguage,
    claimedLanguage,
    releaseLanguage,
    isLanguageConflict,
} from "../src/language/Language";

/**
 * The UI strings are a single module-level binding, read synchronously while a
 * viewer is constructed. Two viewers therefore cannot show different
 * languages — the last one set would win and the other would keep repainting
 * its chrome in the wrong language. Viewers claim the locale they need and a
 * conflict throws instead.
 */
describe("page-wide language claim", () => {
    const holders: symbol[] = [];

    function claim(code: string): symbol {
        const holder = Symbol("test-viewer");
        holders.push(holder);
        claimLanguage(code, holder);
        return holder;
    }

    afterEach(() => {
        // the registry is module-level, so a leaked holder would fail every
        // later test in this file
        for (const holder of holders.splice(0)) {
            releaseLanguage(holder);
        }
    });

    it("lets two viewers share the same language", () => {
        claim("de");
        expect(() => claim("de")).not.toThrow();
        expect(claimedLanguage()).toBe("de");
    });

    it("throws when a second viewer asks for a different language", () => {
        claim("de");
        let thrown: unknown;
        try {
            claim("fr");
        } catch (err) {
            thrown = err;
        }
        expect(thrown).toBeInstanceOf(Error);
        // the message has to be actionable, not just a warning
        expect((thrown as Error).message).toContain('"de"');
        expect((thrown as Error).message).toContain('"fr"');
        expect((thrown as Error).message).toMatch(/language/i);
        expect(isLanguageConflict(thrown)).toBe(true);
    });

    it("re-claiming with the same holder is not a conflict", () => {
        // refreshLanguage() on one viewer re-claims; that must stay allowed
        const holder = claim("en");
        expect(() => claimLanguage("en", holder)).not.toThrow();
        expect(() => releaseLanguage(holder)).not.toThrow();
    });

    it("keeps the claim while a sibling in the same language is alive", () => {
        const first = claim("it");
        const second = claim("it");
        // tearing down one must not free the page for another locale, because
        // the survivor is still reading the shared strings
        releaseLanguage(first);
        expect(claimedLanguage()).toBe("it");
        expect(() => claim("es")).toThrow();
        releaseLanguage(second);
    });

    it("frees the page once the last holder is released", () => {
        const first = claim("ko");
        const second = claim("ko");
        releaseLanguage(first);
        expect(claimedLanguage()).toBe("ko");
        expect(() => claim("ja")).toThrow();
        // the SPA case: the last viewer is torn down, so a later one may use a
        // different language
        releaseLanguage(second);
        expect(claimedLanguage()).toBeNull();
        expect(() => claim("ja")).not.toThrow();
    });

    it("does not treat an unrelated error as a language conflict", () => {
        expect(isLanguageConflict(new Error("boom"))).toBe(false);
        expect(isLanguageConflict("boom")).toBe(false);
    });
});
