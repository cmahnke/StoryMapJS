import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #168 — "Resizing browser window from small -> large"
 * FIXED: the viewer now observes its container and window resizes and
 * re-layouts the map, slider and menubar (trackResize option, default on).
 */
test("issue #168: enlarging the window re-layouts the storymap", async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 500 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1200);

    const before = await page.evaluate(() => {
        const slider = document.querySelector("#storymap-embed .vco-storyslider");
        return {
            sliderWidth: slider?.getBoundingClientRect().width ?? 0,
            viewport: window.innerWidth,
        };
    });

    await page.setViewportSize({ width: 1400, height: 800 });
    // wait for the debounced resize handler (200ms) + layout
    await page.waitForTimeout(800);

    const after = await page.evaluate(() => {
        const slider = document.querySelector("#storymap-embed .vco-storyslider");
        return {
            sliderWidth: slider?.getBoundingClientRect().width ?? 0,
            viewport: window.innerWidth,
        };
    });

    expect(after.viewport).toBe(1400);
    expect(after.sliderWidth).toBeGreaterThan(before.sliderWidth * 1.2);
});

/**
 * The map must re-fit INSTANTLY on resize (no animated drift): the active
 * marker stays in view, centered in the visible (panel-free) half.
 */
test("issue #168: the active marker stays in view after resizes", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2000);

    // wide -> narrow
    await page.setViewportSize({ width: 700, height: 800 });
    await page.waitForTimeout(700);
    const narrow = await page.evaluate(() => {
        const m = document.querySelector("#storymap-embed .vco-map .vco-mapmarker-active");
        const r = m?.getBoundingClientRect();
        return { x: r?.x ?? -999, y: r?.y ?? -999, w: window.innerWidth, h: window.innerHeight };
    });
    expect(narrow.x).toBeGreaterThan(0);
    expect(narrow.x).toBeLessThan(narrow.w);
    expect(narrow.y).toBeGreaterThan(0);
    expect(narrow.y).toBeLessThan(narrow.h);

    // narrow -> wide
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.waitForTimeout(700);
    const wide = await page.evaluate(() => {
        const m = document.querySelector("#storymap-embed .vco-map .vco-mapmarker-active");
        const r = m?.getBoundingClientRect();
        return { x: r?.x ?? -999, y: r?.y ?? -999, w: window.innerWidth, h: window.innerHeight };
    });
    expect(wide.x).toBeGreaterThan(0);
    expect(wide.x).toBeLessThan(wide.w);
    expect(wide.y).toBeGreaterThan(0);
    expect(wide.y).toBeLessThan(wide.h);
});

/**
 * The resize settle is fast: the layout already reflects the new size shortly
 * after the resize burst (leading + trailing debounce).
 */
test("issue #168: the layout settles quickly after a resize burst", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    await page.setViewportSize({ width: 900, height: 800 });
    await page.waitForTimeout(500);
    const layout = await page.evaluate(() => ({
        sliderWidth: document
            .querySelector("#storymap-embed .vco-storyslider")
            ?.getBoundingClientRect().width,
        layout: document.querySelector("#storymap-embed")?.className,
    }));
    // the slider is half the container width in the landscape layout
    expect(layout.sliderWidth).toBeGreaterThan(300);
    expect(layout.sliderWidth).toBeLessThan(500);
    expect(layout.layout).toContain("vco-layout-landscape");
});
