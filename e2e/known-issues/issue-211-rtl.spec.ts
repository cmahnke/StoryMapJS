import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #211 / #245 — "RTL support" / "Right-to-left text"
 * FIXED: locales declare their layout direction (`direction: "rtl"` in
 * he.json/ur.json, `ltr` elsewhere); the resolved locale drives the
 * `vco-rtl` class on the container, which mirrors text alignment and the
 * slide navigation.
 */
test("issue #211: hebrew locale applies the rtl layout", async ({ page }) => {
    await page.goto(harnessUrl("issue-211-rtl", { language: "he" }));
    await waitForStoryMap(page);

    const container = page.locator(".vco-storymap");
    await expect(container).toHaveClass(/vco-rtl/);

    // text content is right-aligned per the .vco-rtl rules
    const textAlign = await page
        .locator(".vco-text-content")
        .first()
        .evaluate((el) => getComputedStyle(el).textAlign);
    expect(textAlign).toBe("right");
});

test("issue #211: ltr locales do not get the rtl class", async ({ page }) => {
    await page.goto(harnessUrl("issue-211-rtl", { language: "en" }));
    await waitForStoryMap(page);

    const container = page.locator(".vco-storymap");
    await expect(container).not.toHaveClass(/vco-rtl/);
    const textAlign = await page
        .locator(".vco-text-content")
        .first()
        .evaluate((el) => getComputedStyle(el).textAlign);
    expect(textAlign).not.toBe("right");
});
