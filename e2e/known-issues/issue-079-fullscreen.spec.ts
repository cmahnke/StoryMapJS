import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #79 — "Integrate Full Screen Button using HTML5 full screen api"
 * Enhancement: the menubar has no fullscreen button. Documents the target
 * behavior; unblocked once a fullscreen control is implemented.
 */
test.fixme("issue #79: fullscreen button in the menubar", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await expect(page.locator(".vco-menubar [class*='fullscreen']")).toHaveCount(1);
    await page.locator(".vco-menubar [class*='fullscreen']").click();
    await expect(page.locator("#storymap-embed:fullscreen")).toBeVisible();
});
