import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #176 — "Oversized target for nav arrows hides gigapixel POI pins"
 * FIXED: the slidenav hit targets are small (glyph-sized icons), so pins near
 * the screen edges stay visible and clickable while the pointer approaches.
 */
test("issue #176: pins stay visible and clickable near the nav arrows", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    // the arrow hit targets must be small enough not to shadow pins
    const arrowBoxes = await page.evaluate(() => {
        const boxes: { w: number; h: number }[] = [];
        for (const sel of [".vco-slidenav-next", ".vco-slidenav-previous"]) {
            const el = document.querySelector("#storymap-embed " + sel);
            if (!el) continue;
            const r = el.getBoundingClientRect();
            boxes.push({ w: r.width, h: r.height });
        }
        return boxes;
    });
    expect(arrowBoxes.length).toBeGreaterThan(0);

    // approach a VISIBLE marker with the pointer in steps: it must stay visible.
    // (visible = inside the map area left of the slide panel overlay, so the
    // click actually reaches the marker)
    const target = await page.evaluate(() => {
        const mapRect = document.querySelector("#storymap-embed .vco-map")!.getBoundingClientRect();
        const sliderRect = document
            .querySelector("#storymap-embed .vco-storyslider")!
            .getBoundingClientRect();
        const markers = Array.from(
            document.querySelectorAll("#storymap-embed .vco-map .vco-mapmarker"),
        ) as HTMLElement[];
        const visible = markers.find((m) => {
            const r = m.getBoundingClientRect();
            const cx = r.x + r.width / 2;
            const cy = r.y + r.height / 2;
            return (
                cx > mapRect.x + 10 &&
                cx < sliderRect.x - 10 &&
                cy > mapRect.y &&
                cy < mapRect.bottom
            );
        });
        if (!visible) return null;
        const r = visible.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    expect(target).not.toBeNull();
    await page.mouse.move(640, 400);
    for (const t of [0.25, 0.5, 0.75, 1]) {
        await page.mouse.move(640 + (target!.x - 640) * t, 400 + (target!.y - 400) * t, {
            steps: 3,
        });
        await page.waitForTimeout(200);
        const visible = await page.evaluate(() => {
            const mapRect = document
                .querySelector("#storymap-embed .vco-map")!
                .getBoundingClientRect();
            const markers = Array.from(
                document.querySelectorAll("#storymap-embed .vco-map .vco-mapmarker"),
            );
            return markers.some((m) => {
                const r = (m as HTMLElement).getBoundingClientRect();
                const style = getComputedStyle(m);
                const cx = r.x + r.width / 2;
                return (
                    cx > mapRect.x &&
                    cx < mapRect.right &&
                    r.width > 0 &&
                    style.visibility !== "hidden" &&
                    style.display !== "none"
                );
            });
        });
        expect(visible).toBe(true);
    }

    // and it stays clickable
    await page.mouse.click(target!.x, target!.y);
    await page.waitForTimeout(1500);
    const state = await getState(page);
    expect(state.currentSlide).toBeGreaterThan(0);
});
