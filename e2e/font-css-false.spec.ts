import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * `font_css: false` opts out of runtime font loading: the viewer appends no
 * font stylesheet and the host page may bundle a font theme instead.
 */
test("font_css: false appends no font stylesheet and renders without errors", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { font_css: false }));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const fontLinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll("link[rel='stylesheet']"))
            .map((l) => (l as HTMLLinkElement).href)
            .filter((h) => h.includes("font.")),
    );
    expect(fontLinks).toEqual([]);

    const slideCount = await page.evaluate(
        () => document.querySelectorAll("#storymap-embed .vco-slide").length,
    );
    expect(slideCount).toBeGreaterThan(0);

    const state = await getState(page);
    expect(state.errors).toEqual([]);
});

test("font_css: false lets the host bundle a font theme", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { font_css: false }));
    await waitForStoryMap(page);

    await page.addStyleTag({ url: "/css/fonts/font.pt.css" });
    await page.evaluate(() => document.fonts.ready);

    await expect
        .poll(() => page.evaluate(() => document.fonts.check('12px "PT Sans"')), {
            timeout: 15000,
        })
        .toBe(true);
});
