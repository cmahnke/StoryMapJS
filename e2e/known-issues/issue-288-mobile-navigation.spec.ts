import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #288 — "Storymap filling mobile screen prevents navigation past
 * the storymap"
 * FIXED: on skinny layouts the map viewport uses `touch-action: pan-y`, so
 * vertical swipes scroll the embedding page instead of being captured as map
 * pans, while navigation controls keep working.
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

test("issue #288: vertical page scrolls pass through the map on skinny layouts", async ({
    page,
}) => {
    await page.setViewportSize({ width: 390, height: 720 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const touchAction = await page.evaluate(() => {
        const viewport = document.querySelector("#storymap-embed .vco-map .ol-viewport");
        return viewport ? getComputedStyle(viewport).touchAction : null;
    });
    // vertical swipes must reach the page (pan-y), not be captured by the map
    expect(touchAction).toContain("pan-y");
});
