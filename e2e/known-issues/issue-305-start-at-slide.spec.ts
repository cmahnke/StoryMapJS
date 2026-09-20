import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #305 — "Default Slide / Hash Bookmarks" (start_at_slide part)
 * FIXED: the start_at_slide option opens the storymap on the requested slide.
 */
test("issue #305: start_at_slide opens the storymap on the requested slide", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide", { start_at_slide: 2 }));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const state = await getState(page);
    expect(state.errors).toEqual([]);
    expect(state.currentSlide).toBe(2);
});
