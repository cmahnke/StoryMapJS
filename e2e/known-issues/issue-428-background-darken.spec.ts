import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #428 — "darkened background applied for slides with background
 * image is not reverted for slides without background"
 * FIXED: goTo resets the background to the default before the slide's own
 * background applies, so the darkening does not leak into the next slide.
 */
test("issue #428: a slide without a background image has no darkened background", async ({
    page,
}) => {
    await page.goto(harnessUrl("issue-428-background"));
    await waitForStoryMap(page);

    // move to the slide WITH the background image
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2500);

    // then to the slide WITHOUT one
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(2),
    );
    await page.waitForTimeout(2500);

    const activeBackground = await page.evaluate(() => {
        const slides = document.querySelectorAll("#storymap-embed .vco-slide");
        const slide = slides[2];
        const bg = slide?.querySelector(".vco-slide-background");
        const style = bg?.getAttribute("style") ?? "";
        return {
            hasGradient: style.includes("linear-gradient"),
            hasBackgroundImage: style.includes("url("),
            opacity: bg ? getComputedStyle(bg).opacity : null,
        };
    });

    // a slide without its own background must show neither the image nor
    // the darkening gradient
    expect(activeBackground.hasBackgroundImage).toBe(false);
    expect(activeBackground.hasGradient).toBe(false);
});
