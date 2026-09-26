import { test, expect, type Page } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

// the swipe machinery only engages on touch devices (Browser.touch)
test.use({ hasTouch: true });

/**
 * Mobile swipe navigation (iOS fix): swiping must work on every slide —
 * not only the first — and a cancelled gesture must not break the next
 * one. Synthetic touch sequences are dispatched on the slider container
 * (reliable across browsers, Browser.touch is true in this context).
 */

/** Dispatch a touch sequence on the slider container. */
async function swipe(page: Page, fromX: number, toX: number): Promise<void> {
    await page.evaluate(
        ([from, to]) => {
            const el = document.querySelector("#storymap-embed .vco-slider-container-mask");
            if (!el) return;
            const mk = (type: string, x: number): TouchEvent => {
                const t = { clientX: x, clientY: 300, screenX: x, screenY: 300 } as Touch;
                const e = new Event(type, { bubbles: true }) as TouchEvent;
                Object.defineProperty(e, "touches", { value: type === "touchend" ? [] : [t] });
                Object.defineProperty(e, "targetTouches", {
                    value: type === "touchend" ? [] : [t],
                });
                Object.defineProperty(e, "changedTouches", { value: [t] });
                return e;
            };
            el.dispatchEvent(mk("touchstart", from));
            el.dispatchEvent(mk("touchmove", from + (to - from) / 2));
            el.dispatchEvent(mk("touchmove", to));
            el.dispatchEvent(mk("touchend", to));
        },
        [fromX, toX],
    );
}

test("swiping advances from the first slide", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    await swipe(page, 600, 200);
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 10_000 })
        .toBe("#slide-1");
});

test("swiping keeps working on later slides (iOS regression)", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    // first swipe: 0 → 1
    await swipe(page, 600, 200);
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 10_000 })
        .toBe("#slide-1");
    await page.waitForTimeout(1500);

    // second swipe on slide 1: 1 → 2 — with the old gesture math the
    // navigation stopped working after the first slide
    await swipe(page, 600, 200);
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 10_000 })
        .toBe("#slide-2");

    const state = await getState(page);
    expect(state.currentSlide).toBe(2);
});

test("swiping back returns to the previous slide", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide", { start_at_slide: 1 }));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    await swipe(page, 200, 600);
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 10_000 })
        .toBe("#slide-0");
});

test("a cancelled gesture does not break the next swipe", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    // a small cancelled gesture (4px, below the swipe threshold): the
    // browser claims the gesture mid-drag
    await page.evaluate(() => {
        const el = document.querySelector("#storymap-embed .vco-slider-container-mask");
        if (!el) return;
        const mk = (type: string, x: number): TouchEvent => {
            const t = { clientX: x, clientY: 300, screenX: x, screenY: 300 } as Touch;
            const e = new Event(type, { bubbles: true }) as TouchEvent;
            Object.defineProperty(e, "touches", { value: type === "touchend" ? [] : [t] });
            Object.defineProperty(e, "targetTouches", {
                value: type === "touchend" ? [] : [t],
            });
            Object.defineProperty(e, "changedTouches", { value: [t] });
            return e;
        };
        el.dispatchEvent(mk("touchstart", 600));
        el.dispatchEvent(mk("touchmove", 596));
        el.dispatchEvent(mk("touchcancel", 596));
    });
    await page.waitForTimeout(500);
    await expect(page.evaluate(() => window.location.hash)).resolves.toBe("#slide-0");

    // the next swipe still navigates
    await swipe(page, 600, 200);
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 10_000 })
        .toBe("#slide-1");
});
