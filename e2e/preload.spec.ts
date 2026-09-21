import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * The next slide's media must start loading as soon as the current slide
 * becomes active — not after arrival — so external media (iframes, player
 * scripts) is already built when the visitor navigates and doesn't compete
 * with the transition animation.
 *
 * Fixture instagram_couch: 21 slides, each with a locally served placeholder
 * image (no network needed beyond the preview server).
 */
test("the next slide's media loads without navigating to it", async ({ page }) => {
    await page.goto(harnessUrl("instagram_couch"));
    await waitForStoryMap(page);

    // still on the first slide ...
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#slide-0");

    // ... yet the second slide's image is already built (its 1200ms load
    // clock started when slide 0 became active, not on arrival)
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const slides = document.querySelectorAll("#storymap-embed .vco-slide");
                    return (
                        slides[1]?.querySelector("img.vco-media-image")?.getAttribute("src") ?? null
                    );
                }),
            { timeout: 15_000 },
        )
        .toContain("placeholder-");
});

test("navigating to the preloaded slide finds its media ready", async ({ page }) => {
    await page.goto(harnessUrl("instagram_couch"));
    await waitForStoryMap(page);

    // wait for the preload to finish first
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const slides = document.querySelectorAll("#storymap-embed .vco-slide");
                    return (
                        slides[1]?.querySelector("img.vco-media-image")?.getAttribute("src") ?? null
                    );
                }),
            { timeout: 15_000 },
        )
        .toContain("placeholder-");

    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#slide-1");

    // no additional image is built on arrival — the preloaded one is reused
    const count = await page.evaluate(() => {
        const slides = document.querySelectorAll("#storymap-embed .vco-slide");
        return slides[1]?.querySelectorAll("img.vco-media-image").length ?? 0;
    });
    expect(count).toBe(1);
});
