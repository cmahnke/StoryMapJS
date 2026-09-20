import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

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
