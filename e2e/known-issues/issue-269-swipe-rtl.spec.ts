import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

// the swipe hint only renders on touch devices
test.use({ hasTouch: true });

/**
 * KNOWN ISSUE #269 — "I18N for swipe to navigate"
 * FIXED: the swipe-to-navigate hint exists in every locale and its icon
 * mirrors in right-to-left locales (swipe-right glyph under `vco-rtl`,
 * swipe-left glyph in LTR).
 */
test("issue #269: the swipe hint icon mirrors in rtl locales", async ({ page }) => {
    await page.goto(harnessUrl("issue-211-rtl", { language: "he" }));
    await waitForStoryMap(page);

    await expect(page.locator(".vco-storymap")).toHaveClass(/vco-rtl/);
    await expect(page.locator(".vco-message-full .vco-icon-swipe-right")).toBeVisible();
    await expect(page.locator(".vco-message-full .vco-icon-swipe-left")).toHaveCount(0);
});

test("issue #269: the swipe hint keeps the ltr icon in ltr locales", async ({ page }) => {
    await page.goto(harnessUrl("issue-211-rtl", { language: "en" }));
    await waitForStoryMap(page);

    await expect(page.locator(".vco-storymap")).not.toHaveClass(/vco-rtl/);
    await expect(page.locator(".vco-message-full .vco-icon-swipe-left")).toBeVisible();
    await expect(page.locator(".vco-message-full .vco-icon-swipe-right")).toHaveCount(0);
});
