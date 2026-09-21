import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * The line animation runs backwards on the back button: navigating back
 * retracts the far end along the route, ending as the traveled path
 * [start..current].
 */
test("the line retracts when navigating back", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);

    const read = () =>
        page.evaluate(() => {
            const f = (
                window as unknown as {
                    __sm?: {
                        _map?: {
                            _line_active?: {
                                getSource?(): {
                                    getFeatures?(): {
                                        getGeometry?(): { getCoordinates?(): unknown[] };
                                    }[];
                                };
                            };
                        };
                    };
                }
            ).__sm?._map?._line_active
                ?.getSource?.()
                .getFeatures?.()[0]
                ?.getGeometry?.()
                .getCoordinates?.().length;
            return f ?? -1;
        });

    // build the line up with forward navigations
    for (const n of [1, 2, 3, 4]) {
        await page.evaluate(
            (x) => (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(x),
            n,
        );
        await page.waitForTimeout(1800);
    }
    const before = await read();
    expect(before).toBeGreaterThan(0);

    // navigate back: the drawn geometry shrinks during the animation
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(2),
    );
    await expect
        .poll(read, { timeout: 5_000, message: "the line retracts below the full route" })
        .toBeLessThan(4);
    await page.waitForTimeout(2500);
    const final = await read();

    // the line retracted and settles at the traveled path [1..2]
    expect(final).toBe(2);
});

/**
 * The menubar buttons can be disabled via the constructor options.
 */
test("show_overview / show_back_to_start / fullscreen hide their buttons", async ({ page }) => {
    await page.goto(
        harnessUrl("katrina", {
            show_overview: false,
            show_back_to_start: false,
            fullscreen: false,
        }),
    );
    await waitForStoryMap(page);

    // all three buttons are hidden; only the collapse toggle (portrait) or
    // nothing (landscape) remains visible
    await expect(page.locator(".vco-menubar-button:visible")).toHaveCount(0);
});

test("the menubar buttons are visible by default", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);
    // 3 buttons in landscape (overview, back to start, fullscreen); the
    // collapse toggle is hidden in landscape
    const count = await page.locator(".vco-menubar .vco-menubar-button:visible").count();
    expect(count).toBeGreaterThanOrEqual(3);
});
