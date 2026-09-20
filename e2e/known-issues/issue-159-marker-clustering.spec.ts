import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #159 — "Marker Clustering"
 * Enhancement: densely clustered markers are not clustered, they overlap.
 * Documents the target behavior (e.g. cluster at low zoom levels).
 */
test.fixme("issue #159: tightly grouped markers are clustered at low zoom", async ({ page }) => {
    await page.goto(harnessUrl("issue-425-many-slides"));
    await waitForStoryMap(page);
    // 150 markers over 10 lat/lon steps overlap heavily at overview zoom
    const markerBoxes = await page.evaluate(() => {
        const markers = document.querySelectorAll("#storymap-embed .vco-mapmarker");
        return Array.from(markers).map((m) => {
            const r = m.getBoundingClientRect();
            return { x: r.x, y: r.y, w: r.width, h: r.height };
        });
    });
    // with clustering, distinct cluster bubbles would be fewer than the markers
    const distinct = new Set(markerBoxes.map((b) => `${Math.round(b.x)}:${Math.round(b.y)}`));
    expect(distinct.size).toBeLessThan(markerBoxes.length);
});
