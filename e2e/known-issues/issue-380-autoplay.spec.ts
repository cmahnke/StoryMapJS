import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #380 — "Feature request: slides autoplay option"
 * FIXED: the autoplay option (milliseconds) advances slides automatically and
 * stops at the last slide or on user interaction.
 */
test("issue #380: autoplay advances slides automatically", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide", { autoplay: 600 }));
    await waitForStoryMap(page);

    await expect
        .poll(
            () =>
                page.evaluate(
                    () =>
                        (window as unknown as { __sm?: { current_slide: number } }).__sm
                            ?.current_slide,
                ),
            { timeout: 8000 },
        )
        .toBeGreaterThan(0);

    const state = await getState(page);
    expect(state.errors).toEqual([]);
});

/**
 * Autoplay stops on user interaction.
 */
test("issue #380: user interaction stops autoplay", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide", { autoplay: 600 }));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    // interact: click on the storymap
    await page.click("#storymap-embed .vco-storyslider");
    await page.waitForTimeout(2500);

    const first = await page.evaluate(
        () => (window as unknown as { __sm?: { current_slide: number } }).__sm?.current_slide,
    );
    await page.waitForTimeout(2500);
    const second = await page.evaluate(
        () => (window as unknown as { __sm?: { current_slide: number } }).__sm?.current_slide,
    );
    // no advancement after the interaction (slide may have advanced once before it)
    expect(second).toBe(first);
});
