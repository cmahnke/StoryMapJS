import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Scroll hint: a bouncing downward arrow appears when the slide content
 * overflows (the slide box is scrollable), anchored to the bottom center of
 * the visible slide area. It is tappable (scrolls one step down) and hides
 * after the first scroll of any kind; revisiting the slide re-shows it. A
 * short slide shows no hint.
 *
 * Uses the local scroll-hint fixture (one long-text slide that overflows,
 * one short one).
 */
async function openOverflowingSlide(page: import("@playwright/test").Page) {
    // short viewport: the landscape slider is ~300px tall, so the
    // long-text slide overflows while the short one still fits
    await page.setViewportSize({ width: 1280, height: 500 });
    await page.goto(harnessUrl("scroll-hint"));
    await waitForStoryMap(page);
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2000);
}

function hintState(page: import("@playwright/test").Page) {
    return page.evaluate(() => {
        const el = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        const hint = el?.querySelector(".vco-slide-scroll-hint") as HTMLElement | null;
        const rect = hint?.getBoundingClientRect();
        const slideRect = el?.getBoundingClientRect();
        return {
            inDom: !!hint,
            visible: hint ? getComputedStyle(hint).display !== "none" : false,
            overflow: el ? el.scrollHeight - el.clientHeight : null,
            // anchored to the bottom center of the visible slide area
            nearBottomCenter:
                rect && slideRect
                    ? Math.abs(rect.left + rect.width / 2 - (slideRect.left + slideRect.width / 2)) <
                          4 &&
                      Math.abs(rect.bottom - slideRect.bottom) < 90
                    : false,
            scrollTop: el?.scrollTop ?? null,
        };
    });
}

test("the scroll hint shows on overflowing slides, centered at the bottom", async ({ page }) => {
    await openOverflowingSlide(page);
    const state = await hintState(page);
    expect(state.overflow).toBeGreaterThan(0);
    expect(state.visible).toBe(true);
    expect(state.nearBottomCenter).toBe(true);
});

test("tapping the hint scrolls the slide down and hides it", async ({ page }) => {
    await openOverflowingSlide(page);
    await page.evaluate(() =>
        document
            .querySelector("#storymap-embed .vco-slide-scroll-hint")
            ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    await page.waitForTimeout(1500);
    const state = await hintState(page);
    expect(state.scrollTop).toBeGreaterThan(0);
    expect(state.visible).toBe(false);
});

test("the first scroll hides the hint; a revisit re-shows it", async ({ page }) => {
    await openOverflowingSlide(page);
    await page.evaluate(() => {
        const el = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        el.scrollTop = 40;
    });
    await page.waitForTimeout(400);
    expect((await hintState(page)).visible).toBe(false);

    // revisit: the dismissed state resets per activation
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(0),
    );
    await page.waitForTimeout(1500);
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2000);
    expect((await hintState(page)).visible).toBe(true);
});

test("a slide that fits shows no hint", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 500 });
    await page.goto(harnessUrl("scroll-hint"));
    await waitForStoryMap(page);
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(2),
    );
    await page.waitForTimeout(2000);
    const state = await page.evaluate(() => {
        const el = document.querySelectorAll("#storymap-embed .vco-slide")[2];
        const hint = el?.querySelector(".vco-slide-scroll-hint");
        return { overflow: el.scrollHeight - el.clientHeight, inDom: !!hint };
    });
    expect(state.overflow).toBeLessThanOrEqual(1);
    expect(state.inDom).toBe(false);
});

test("the touch scrollbar is wide with a visible track", async ({ page }) => {
    await page.goto(harnessUrl("scroll-hint"));
    await waitForStoryMap(page);

    const styles = await page.evaluate(() => {
        const el = document.querySelector("#storymap-embed .vco-slide") as HTMLElement;
        const cs = getComputedStyle(el);
        return { width: cs.scrollbarWidth, color: cs.scrollbarColor };
    });
    // the container carries .vco-mobile only on touch devices — Playwright's
    // default desktop context is not touch, so the touch styling must not
    // leak there
    expect(styles.width).toBe("thin");
    // with a touch context the slide gets the wider scrollbar + track color
    const touchPage = await page.context().browser()?.newContext({ hasTouch: true });
    if (!touchPage) return;
    const tp = await touchPage.newPage();
    await tp.setViewportSize({ width: 1280, height: 800 });
    await tp.goto(harnessUrl("scroll-hint"));
    await waitForStoryMap(tp);
    const touchStyles = await tp.evaluate(() => {
        const el = document.querySelector("#storymap-embed .vco-slide") as HTMLElement;
        const cs = getComputedStyle(el);
        return { width: cs.scrollbarWidth, color: cs.scrollbarColor };
    });
    expect(touchStyles.width).toBe("auto");
    expect(touchStyles.color).not.toBe("");
    await touchPage.close();
});
