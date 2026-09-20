import { test, expect } from "@playwright/test";
import { collectPageErrors, getState, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #368 — "null style attribute" (e2e part; see also
 * tests/issue-368-null-safety.test.ts)
 * Slides without media/location must not break rendering or navigation.
 */
test("issue #368: slides with missing media/location render without errors", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto(harnessUrl("issue-368-null-fields"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(3),
    );
    await page.waitForTimeout(1500);

    const state = await getState(page);
    expect(state.errors).toEqual([]);
    expect(errors).toEqual([]);
    expect(state.currentSlide).toBe(3);
});

/**
 * KNOWN ISSUE #246 — "review URL protocols"
 * All bundled example fixtures are protocol-safe (https or same-origin
 * relative paths) so the viewer works on https pages without mixed-content
 * blocking.
 */
test("issue #246: example fixtures use safe url protocols", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const insecure = await page.evaluate(async () => {
        const res = await fetch("/examples/issue-506-marker-sync.json");
        const data = (await res.json()) as { storymap: { slides: { media?: { url?: string } }[] } };
        return data.storymap.slides
            .map((s) => s.media?.url ?? "")
            .filter((url) => url.startsWith("http://"));
    });
    expect(insecure).toEqual([]);
});
