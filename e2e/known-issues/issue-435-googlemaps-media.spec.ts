import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #435 / #410 — "Google Maps as a Media Type not working"
 * STILL APPLIES: the Google Maps media type is commented out in the media
 * table, so the URL falls through to the generic website iframe which Google
 * refuses to serve (X-Frame-Options) — the loading state never resolves.
 * Expected failure until the type is re-added with a modern embed endpoint.
 */
test("issue #435: a Google Maps media url renders usable media", async ({ page }) => {
    // simulate Google's X-Frame-Options refusal deterministically
    await page.route("**/maps.google.com/**", (route) => route.abort());
    await page.goto(harnessUrl("issue-435-googlemaps"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const state = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        return {
            mediaItem: slide?.querySelector(".vco-media-item"),
            isMapMedia: !!slide?.querySelector(".vco-media-map, iframe[src*='maps.google']"),
            loadingVisible: !!slide?.querySelector(".vco-media-loading, .vco-loading"),
        };
    });

    expect(state.isMapMedia).toBe(true);
    expect(state.loadingVisible).toBe(false);
});
