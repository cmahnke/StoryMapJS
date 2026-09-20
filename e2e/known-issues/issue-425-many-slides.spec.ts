import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #425 — "StoryMap crashes on mobile with larger number of slides"
 * A 150-slide storymap must render and navigate without crashing.
 */
test("issue #425: a storymap with 150 slides renders and navigates", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 720 });
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto(harnessUrl("issue-425-many-slides"));
    await waitForStoryMap(page);

    const rendered = await page.evaluate(() => ({
        slides: document.querySelectorAll("#storymap-embed .vco-slide").length,
    }));
    expect(rendered.slides).toBe(151);

    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(149),
    );
    await page.waitForTimeout(2500);

    const current = await page.evaluate(
        () => (window as unknown as { __sm?: { current_slide: number } }).__sm?.current_slide,
    );
    expect(current).toBe(149);
    expect(errors).toEqual([]);
});
