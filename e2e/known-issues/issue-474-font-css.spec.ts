import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #474 — "Unable to change font"
 * FIXED: the font_css option (stock theme name or stylesheet URL) loads the
 * font theme at runtime via the library.
 */
test("issue #474: a stock font theme loads via the font_css option", async ({ page }) => {
    await page.goto(harnessUrl("gameofthrones", { font_css: "stock:lustria-lato" }));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const fonts = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("link[rel='stylesheet']")).map(
            (l) => (l as HTMLLinkElement).href,
        );
        const fontLinks = links.filter((h) => h.includes("font."));
        const headline = document.querySelector("#storymap-embed .vco-headline");
        return { fontLinks, headlineFont: headline ? getComputedStyle(headline).fontFamily : "" };
    });

    expect(fonts.fontLinks.length).toBeGreaterThan(0);
    // the gameofthrones fixture uses the lustria-lato theme
    expect(fonts.fontLinks.join(" ")).toContain("lustria");
});
