import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Accessibility: prefers-reduced-motion collapses slide glides to instant
 * changes and keeps autoplay off (WCAG 2.2.2).
 */
test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("slide changes are instant under reduced motion", async ({ page }) => {
        await page.goto(harnessUrl("issue-305-start-at-slide"));
        await waitForStoryMap(page);

        // no 1s+ glide: the hash syncs (which happens on the change event)
        // right after the programmatic goTo
        const start = Date.now();
        await page.evaluate(() =>
            (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
        );
        await expect
            .poll(() => page.evaluate(() => window.location.hash), { timeout: 2000 })
            .toBe("#slide-1");
        const elapsed = Date.now() - start;
        // under normal motion this transition takes >= 1120ms; reduced
        // motion applies the change instantly
        expect(elapsed).toBeLessThan(600);

        const state = await getState(page);
        expect(state.currentSlide).toBe(1);
    });

    test("autoplay stays off under reduced motion", async ({ page }) => {
        await page.goto(harnessUrl("issue-305-start-at-slide", { autoplay: 600 }));
        await waitForStoryMap(page);
        await page.waitForTimeout(3000);

        // autoplay=600 would have advanced several slides; reduced motion
        // never starts the timer
        const state = await getState(page);
        expect(state.currentSlide).toBe(0);
    });
});
