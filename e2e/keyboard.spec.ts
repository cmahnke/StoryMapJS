import { test, expect } from "@playwright/test";
import { collectPageErrors, getState, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * The `keyboard` option drives slide navigation from arrow keys anywhere
 * on the page. Default off: arrows only work with the slide panel focused
 * (see issue-472).
 */
test("keyboard option navigates slides from anywhere", async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await page.goto(harnessUrl("issue-305-start-at-slide", { keyboard: true }));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    // no focus tricks: arrows work straight from the body
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1500);
    let state = await getState(page);
    expect(state.currentSlide).toBe(1);

    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(1500);
    state = await getState(page);
    expect(state.currentSlide).toBe(0);

    expect(state.errors).toEqual([]);
    expect(pageErrors).toEqual([]);
});

test("arrows stay local without the keyboard option", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1500);
    const state = await getState(page);
    expect(state.currentSlide).toBe(0);
    expect(state.errors).toEqual([]);
});
