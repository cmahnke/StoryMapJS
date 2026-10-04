import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Accessibility chrome: the skip link jumps to the slides, the autoplay
 * toggle pauses advancement, and map pins are keyboard-operable.
 */
test("skip link jumps to the slide content", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);

    // the skip link is the first tab stop inside the widget
    await page.keyboard.press("Tab");
    const link = page.locator("#storymap-embed a.vco-skip-link:focus");
    await expect.poll(() => link.count()).toBe(1);
    const href = await link.getAttribute("href");
    expect(href).toMatch(/#.+slides$/);
    const before = await page.evaluate(() => window.location.hash);
    await link.press("Enter");
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(href);
    expect(href).not.toBe(before);
});

test("autoplay toggle pauses and resumes", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { autoplay: 60000 }));
    await waitForStoryMap(page);

    const toggle = page.locator("#storymap-embed button.vco-menubar-autoplay");
    await expect.poll(() => toggle.count()).toBe(1);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(toggle).toHaveText(/resume/i);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    const state = await getState(page);
    expect(state.errors).toEqual([]);
});

test("map pins are keyboard-operable", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);
    // let the initial fit glide settle so the pin stays under its coordinates
    await page.waitForTimeout(1500);
    const pin = page.locator("#storymap-embed .vco-mapmarker").first();
    await expect.poll(() => pin.count()).toBeGreaterThan(0);
    await expect(pin).toHaveAttribute("tabindex", "0");
    await expect(pin).toHaveAttribute("role", "button");
    const before = (await getState(page)).currentSlide;
    await pin.focus();
    await page.keyboard.press("Enter");
    await expect
        .poll(() =>
            page.evaluate(
                () => (window as unknown as { __sm: { current_slide: number } }).__sm.current_slide,
            ),
        )
        .not.toBe(before);
});
