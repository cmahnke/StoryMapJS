import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #243 — "Show the name of the place on the map"
 * FIXED: the marker_labels option shows the slide headline as a label on the
 * active map marker.
 */
test("issue #243: the active marker shows the place name label", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync", { marker_labels: true }));
    await waitForStoryMap(page);
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2000);

    const label = await page.evaluate(() => {
        const el = document.querySelector(
            "#storymap-embed .vco-map .vco-mapmarker-active .vco-marker-label",
        );
        return el?.textContent ?? null;
    });
    expect(label).not.toBeNull();
    expect(label!.length).toBeGreaterThan(0);
});

test("issue #243: no labels by default", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2000);

    const count = await page.evaluate(
        () => document.querySelectorAll("#storymap-embed .vco-marker-label").length,
    );
    expect(count).toBe(0);
});
