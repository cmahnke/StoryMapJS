import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

test.use({ hasTouch: true });

/**
 * KNOWN ISSUE #434 — "Map icon touch on Android/Chrome and Windows-mobile/Edge
 * not behaving as expected"
 * Tapping a marker must navigate to its slide (synthetic touch tap).
 */
test("issue #434: tapping a map marker navigates to its slide", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 700 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const box = await page.evaluate(() => {
        const marker = document.querySelector(
            "#storymap-embed .vco-map .vco-mapmarker",
        ) as HTMLElement | null;
        if (!marker) return null;
        const r = marker.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    expect(box).not.toBeNull();

    await page.touchscreen.tap(box!.x, box!.y);
    await page.waitForTimeout(1500);

    const current = await page.evaluate(
        () => (window as unknown as { __sm?: { current_slide: number } }).__sm?.current_slide,
    );
    expect(current).toBeGreaterThan(0);
});

test("issue #434: markers have an adequate touch target size", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 700 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const box = await page.evaluate(() => {
        const marker = document.querySelector("#storymap-embed .vco-map .vco-mapmarker");
        if (!marker) return null;
        const r = marker.getBoundingClientRect();
        return { w: r.width, h: r.height };
    });
    expect(box).not.toBeNull();
    // enlarged invisible tap target: at least 44px in both dimensions
    expect(box!.w).toBeGreaterThanOrEqual(44);
    expect(box!.h).toBeGreaterThanOrEqual(44);
});
