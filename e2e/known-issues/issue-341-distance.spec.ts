import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #341 — "Distance in KM between places"
 * FIXED: the `show_distance` option adds a menubar element with the
 * great-circle length of the marker route (haversine over real coordinates).
 */
test("issue #341: show_distance displays the route length", async ({ page }) => {
    await page.goto(harnessUrl("issue-341-distance", { show_distance: true }));
    await waitForStoryMap(page);

    const distance = page.locator(".vco-menubar-distance");
    await expect(distance).toBeVisible();

    // the fixture route spans exactly 5 degrees of latitude ≈ 555.97 km
    const text = await distance.textContent();
    expect(text).toMatch(/556\s*km/);
    expect(text).toMatch(/mi/);
});

test("issue #341: distance display is hidden by default", async ({ page }) => {
    await page.goto(harnessUrl("issue-341-distance"));
    await waitForStoryMap(page);

    await expect(page.locator(".vco-menubar-distance")).toHaveCount(0);
});
