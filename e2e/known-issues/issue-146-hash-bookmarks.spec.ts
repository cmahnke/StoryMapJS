import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #146 — "Hash Bookmarks" (merged with #305)
 * FIXED: a #slide-N hash deep-links the initial slide and stays in sync with
 * navigation, including browser back/forward.
 */
test("issue #146: a #slide-N hash deep-links the initial slide", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide") + "#slide-2");
    await waitForStoryMap(page);
    await page.waitForTimeout(2000);

    const state = await getState(page);
    expect(state.errors).toEqual([]);
    expect(state.currentSlide).toBe(2);
    expect(await page.evaluate(() => window.location.hash)).toBe("#slide-2");
});

test("issue #146: navigation updates the hash", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(3),
    );

    // the change event fires when the slide animation completes
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 10000 })
        .toBe("#slide-3");
});
