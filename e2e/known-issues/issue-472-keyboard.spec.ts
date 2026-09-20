import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #472 — "Support keyboard navigation"
 * FIXED: arrow keys navigate between slides when the storymap has focus.
 */
test("issue #472: arrow keys navigate between slides", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    await page.click("#storymap-embed .vco-storyslider");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1500);

    let state = await getState(page);
    expect(state.currentSlide).toBe(1);

    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(1500);

    state = await getState(page);
    expect(state.currentSlide).toBe(0);
});
