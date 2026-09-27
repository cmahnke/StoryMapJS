import { describe, expect, it } from "vitest";
import * as LanguageModule from "../src/language/Language";
import { Language, setLanguage } from "../src/language/Language";
import MenuBar from "../src/ui/MenuBar";

/**
 * `setLanguage` is synchronous: the viewer resolves its labels while it is
 * being constructed, so the locale has to be available immediately.
 */
describe("viewer chrome locales", () => {
    it("provides German fullscreen labels", () => {
        const de = setLanguage("de");
        expect(de.buttons?.fullscreen).toBe("Vollbild");
        expect(de.buttons?.exit_fullscreen).toBe("Vollbild beenden");
    });

    it("falls back to English for keys missing in German", async () => {
        // German has no messages.error, and the per-service consent strings
        // are English-only in 28 of the 29 bundled locales
        const de = setLanguage("de");
        expect(de.buttons?.fullscreen).toBeTruthy();
        expect(de.messages?.error).toBe("Error loading");
        expect(de.messages?.consent_allow).toBe("Allow");
    });

    it("does not poison the shared English default across switches", async () => {
        setLanguage("de");
        const en = setLanguage("en");
        expect(en.buttons?.fullscreen).toBe("Full Screen");
        expect(en.buttons?.exit_fullscreen).toBe("Exit Full Screen");
        expect(en.buttons?.map_overview).toBe("Map Overview");
        // and switching back still resolves German, not the polluted merge
        const de = setLanguage("de");
        expect(de.buttons?.map_overview).toBe("Kartenübersicht");
        expect(Language.buttons?.fullscreen).toBe("Vollbild");
    });

    it("reports the right-to-left direction for Hebrew", () => {
        const { isRtl, currentLocale } = LanguageModule;
        setLanguage("he");
        expect(isRtl()).toBe(true);
        expect(currentLocale()).toBe("he");
        setLanguage("de");
        expect(isRtl()).toBe(false);
        expect(currentLocale()).toBe("de");
    });

    it("falls back to English for an unknown locale code", async () => {
        const unknown = setLanguage("xx");
        expect(unknown.buttons?.map_overview).toBe("Map Overview");
        expect(unknown.messages?.loading).toBe("Loading");
    });
});

describe("MenuBar.refreshLabels", () => {
    function menubar(): MenuBar {
        const container = document.createElement("div");
        document.body.appendChild(container);
        return new MenuBar(container, document.body, {});
    }

    it("repaints labels after a runtime language switch", async () => {
        setLanguage("de");
        const bar = menubar();
        expect(bar._el.button_fullscreen.innerHTML).toContain("Vollbild");
        setLanguage("en");
        bar.refreshLabels();
        expect(bar._el.button_fullscreen.innerHTML).toContain("Full Screen");
        expect(bar._el.button_overview.innerHTML).toContain("Map Overview");
    });
});
