import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Accessibility: the menubar actions are real <button>s (keyboard/AT
 * operable) and the slider nav arrows are focusable + Enter-activatable.
 */
test("menubar actions are real buttons", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);

    const buttons = await page.evaluate(() =>
        Array.from(document.querySelectorAll("#storymap-embed .vco-menubar-button")).map((el) =>
            el.tagName.toLowerCase(),
        ),
    );
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((tag) => tag === "button")).toBe(true);
});

test("menubar buttons operate with Enter", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide", { start_at_slide: 1 }));
    await waitForStoryMap(page);

    // focus the back-to-start button and press Enter
    const backToStart = page.locator("#storymap-embed .vco-menubar-button", {
        hasText: /start|beginning|Anfang/i,
    });
    const count = await backToStart.count();
    test.skip(count === 0, "back-to-start button not visible");

    await backToStart.first().focus();
    await page.keyboard.press("Enter");
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 10_000 })
        .toBe("#slide-0");
});

test("nav arrows are keyboard operable", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);

    const nav = page.locator("#storymap-embed .vco-slidenav-next");
    await expect(nav).toHaveAttribute("role", "button");
    await expect(nav).toHaveAttribute("tabindex", "0");
    await expect(nav).toHaveAttribute("aria-label", "Next slide");

    await nav.focus();
    await page.keyboard.press("Enter");
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 10_000 })
        .toBe("#slide-1");

    const state = await getState(page);
    expect(state.currentSlide).toBe(1);
});
