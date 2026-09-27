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

    it("translates the consent strings in German", () => {
        // these were English-only in German until the locale gap was closed,
        // which is what let the gap go unnoticed (see scripts/check-locales.mjs)
        const de = setLanguage("de");
        expect(de.messages?.error).toBe("Fehler beim Laden");
        expect(de.messages?.consent_allow).toBe("Erlauben");
        expect(de.messages?.consent_service_tiles).toBe("Kartenkacheln");
    });

    it("falls back to English for keys missing in a locale that has gaps", async () => {
        // Estonian is one of the five locales still awaiting a native speaker;
        // the runtime merge means it shows English rather than breaking
        const et = setLanguage("et");
        expect(et.buttons?.fullscreen).toBeTruthy();
        expect(et.messages?.error).toBe("Error loading");
        expect(et.messages?.consent_allow).toBe("Allow");
        // ...but the keys it does define stay Estonian
        expect(et.messages?.loading).toBe("Laadib");
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
