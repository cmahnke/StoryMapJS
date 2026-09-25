import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUES #242 / #263 — "Add Fonts in non latin languages" / "New fonts"
 * FIXED (font coverage): the stock themes ship non-latin subsets from their
 * Fontsource packages (cyrillic, greek, hebrew, vietnamese where the family
 * provides them), and the Cairo theme adds arabic coverage.
 */
test("issue #242: theme fonts cover cyrillic, greek and hebrew", async ({ page }) => {
    await page.goto(harnessUrl("issue-242-nonlatin", { font_css: "stock:knightlab" }));
    await waitForStoryMap(page);

    // headlines in all four scripts render
    for (const headline of ["Карта мира", "Αθήνα", "ירושלים", "القاهرة"]) {
        await expect(page.locator(".vco-headline", { hasText: headline }).first()).toBeVisible();
    }

    // the webfont faces (not system fallback) cover each script — load()
    // forces the unicode-range-split face; check() then proves it is usable
    await expect
        .poll(() =>
            page.evaluate(async () => {
                try {
                    await Promise.all([
                        document.fonts.load('40px "Bitter"', "Ж"),
                        document.fonts.load('40px "Roboto Slab"', "Ω"),
                        document.fonts.load('40px "Open Sans"', "ש"),
                    ]);
                } catch {
                    return false;
                }
                return (
                    document.fonts.check('40px "Bitter"', "Ж") &&
                    document.fonts.check('40px "Roboto Slab"', "Ω") &&
                    document.fonts.check('40px "Open Sans"', "ש")
                );
            }),
        )
        .toBe(true);
});

test("issue #242: the cairo theme covers arabic", async ({ page }) => {
    await page.goto(harnessUrl("issue-242-nonlatin", { font_css: "stock:cairo" }));
    await waitForStoryMap(page);

    await expect(page.locator(".vco-headline", { hasText: "القاهرة" }).first()).toBeVisible();
    await expect
        .poll(() =>
            page.evaluate(async () => {
                try {
                    await document.fonts.load('40px "Cairo"', "ق");
                } catch {
                    return false;
                }
                return document.fonts.check('40px "Cairo"', "ق");
            }),
        )
        .toBe(true);
});
