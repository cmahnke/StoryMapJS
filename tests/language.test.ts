import { describe, expect, it } from "vitest";
import { Language, setLanguage } from "../src/language/Language";
import MenuBar from "../src/ui/MenuBar";

describe("viewer chrome locales", () => {
    it("provides German fullscreen labels", () => {
        const de = setLanguage("de");
        expect(de.buttons?.fullscreen).toBe("Vollbild");
        expect(de.buttons?.exit_fullscreen).toBe("Vollbild beenden");
    });

    it("falls back to English for keys missing in German", () => {
        const de = setLanguage("de");
        expect(de.buttons?.fullscreen).toBeTruthy();
        expect(de.messages?.error).toBe("Error loading");
    });

    it("does not poison the shared English default across switches", () => {
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
});

describe("MenuBar.refreshLabels", () => {
    function menubar(): MenuBar {
        const container = document.createElement("div");
        document.body.appendChild(container);
        return new MenuBar(container, document.body, {});
    }

    it("repaints labels after a runtime language switch", () => {
        setLanguage("de");
        const bar = menubar();
        expect(bar._el.button_fullscreen.innerHTML).toContain("Vollbild");
        setLanguage("en");
        bar.refreshLabels();
        expect(bar._el.button_fullscreen.innerHTML).toContain("Full Screen");
        expect(bar._el.button_overview.innerHTML).toContain("Map Overview");
    });
});
