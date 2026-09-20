import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #288 — "Storymap filling mobile screen prevents navigation past
 * the storymap"
 * PARTIALLY APPLIES: navigation IS possible on a small screen, but only via
 * the small floating slidenav icon — the .vco-slidenav-next container itself
 * collapses to 0x0 on skinny layouts, so the hit target is tiny.
 */
test("issue #288: navigation works on a small (mobile) screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 720 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const next = page.locator("#storymap-embed .vco-slidenav-next .vco-slidenav-icon").first();
    await expect(next).toBeVisible();

    await next.click({ force: true });
    await page.waitForTimeout(1500);

    const state = await getState(page);
    expect(state.errors).toEqual([]);
    expect(state.currentSlide).toBe(1);
});
