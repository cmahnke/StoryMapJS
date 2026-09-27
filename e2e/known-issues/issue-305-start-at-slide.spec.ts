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

/**
 * Same option, but supplied by the storymap *data* rather than as a
 * constructor argument. The data is merged into `options` after the
 * constructor has already read `start_at_slide` into `current_slide`, and
 * the slider's opening `goTo()` fires before StoryMap attaches its `change`
 * listener — so the data path silently stayed on slide 0 (wrong hash, wrong
 * progress bar, bogus 0→4 jump on the first navigation).
 */
test("issue #305: start_at_slide from the storymap data is honoured", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide-data"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const state = await getState(page);
    expect(state.errors).toEqual([]);
    expect(state.currentSlide).toBe(3);

    // the hash must agree with the resolved slide
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#slide-3");
});
