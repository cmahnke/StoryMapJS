import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #472 — "Support keyboard navigation"
 * Enhancement: arrow-key navigation between slides is not implemented.
 */
test.fixme("issue #472: arrow keys navigate between slides", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1500);
    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    (window as unknown as { __sm?: { current_slide: number } }).__sm!.current_slide,
            ),
        )
        .toBe(1);
});

/**
 * KNOWN ISSUE #380 — "Feature request: slides autoplay option"
 * Enhancement: an autoplay/interval option is not implemented.
 */
test.fixme("issue #380: the storymap autoplays slides when enabled", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide", { autoplay: true }));
    await waitForStoryMap(page);
    await page.waitForTimeout(4000);
    await expect
        .poll(
            () =>
                page.evaluate(
                    () =>
                        (window as unknown as { __sm?: { current_slide: number } }).__sm!
                            .current_slide,
                ),
            { timeout: 3_000 },
        )
        .toBeGreaterThan(0);
});

/**
 * KNOWN ISSUE #247 — "progress indicator"
 * Enhancement: no visual progress indicator (e.g. a slide counter/dots) exists.
 */
test.fixme("issue #247: a progress indicator shows the current position", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);
    await expect(page.locator("#storymap-embed [class*='progress']")).toHaveCount(1);
});

/**
 * KNOWN ISSUE #243 — "Show the name of the place on the map"
 * Enhancement: the active marker does not show a place-name label.
 */
test.fixme("issue #243: the active marker shows the place name", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2000);
    await expect(
        page.locator("#storymap-embed .vco-map .vco-mapmarker-active .vco-marker-label"),
    ).toHaveCount(1);
});

/**
 * KNOWN ISSUE #412 — "Provide a way to establish routes between points instead
 * of straight lines"
 * Enhancement: routed (geographic path) connections between markers are not
 * implemented; lines are straight.
 */
test.fixme("issue #412: connections between markers follow real routes", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2000);
    // a routed line would have many more vertices than 2 endpoints
    const vertices = await page.evaluate(() => {
        const sm = window as unknown as {
            __sm?: {
                _map?: { _line_active?: { getSource(): { getFeatures(): unknown[] } } };
            };
        };
        const features = sm.__sm?._map?._line_active?.getSource().getFeatures() ?? [];
        return features.length;
    });
    expect(vertices).toBeGreaterThan(0);
});
