import { describe, expect, it } from "vitest";
import { hexToRgb, parseCssColor } from "../src/core/Util";
import { resolveFontCssUrl } from "../src/storymap/StoryMap";

describe("parseCssColor", () => {
    it("parses hex colors like hexToRgb", () => {
        expect(parseCssColor("#c34528")).toEqual({ r: 195, g: 69, b: 40 });
        expect(parseCssColor("#FFF")).toEqual({ r: 255, g: 255, b: 255 });
        expect(parseCssColor("0033FF")).toEqual({ r: 0, g: 51, b: 255 });
    });

    it("parses rgb() and rgba() functional notation", () => {
        expect(parseCssColor("rgb(248, 244, 235)")).toEqual({ r: 248, g: 244, b: 235 });
        expect(parseCssColor("rgba(248, 244, 235, 1)")).toEqual({ r: 248, g: 244, b: 235 });
        expect(parseCssColor("rgb(100%, 0%, 0%)")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("parses named colors", () => {
        expect(parseCssColor("red")).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseCssColor("Cornsilk")).toEqual({ r: 255, g: 248, b: 220 });
    });

    it("returns null for unparseable values", () => {
        expect(parseCssColor("not-a-color")).toBeNull();
        expect(parseCssColor("")).toBeNull();
        expect(hexToRgb("not-a-color")).toBeNull();
    });
});

describe("resolveFontCssUrl", () => {
    it("resolves stock themes against the library location", () => {
        expect(resolveFontCssUrl("stock:default")).toMatch(/css\/fonts\/font\.default\.css$/);
    });

    it("passes absolute URLs through untouched", () => {
        expect(resolveFontCssUrl("https://example.com/fonts/a.css")).toBe(
            "https://example.com/fonts/a.css",
        );
    });

    it("resolves relative paths against the page URL", () => {
        expect(resolveFontCssUrl("fonts/font.default.css")).toBe(
            new URL("fonts/font.default.css", document.baseURI).href,
        );
    });
});
