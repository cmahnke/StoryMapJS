import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #79 — "Integrate Full Screen Button using HTML5 full screen api"
 * (merged with #285 "Fullscreen")
 * FIXED: the menubar has a fullscreen toggle (option `fullscreen`, default
 * true) driving the standard HTML5 fullscreen API.
 */
test("issue #79: fullscreen button toggles document fullscreen state", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const button = page.locator("#storymap-embed .vco-menubar-button:has(.vco-icon-resize-full)");
    await expect(button).toBeVisible();

    // enter fullscreen
    await button.click();
    await expect(page.locator("#storymap-embed:fullscreen")).toBeVisible();

    // the button reflects the active state
    await expect(
        page.locator("#storymap-embed .vco-menubar-button:has(.vco-icon-resize-small)"),
    ).toBeVisible();

    // exit fullscreen again
    await page.locator("#storymap-embed .vco-menubar-button:has(.vco-icon-resize-small)").click();
    await expect(page.locator("#storymap-embed:fullscreen")).toHaveCount(0);
});

test("issue #79: the fullscreen button can be disabled via options", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync", { fullscreen: false }));
    await waitForStoryMap(page);

    const fullscreenHidden = await page.evaluate(() => {
        const buttons = Array.from(
            document.querySelectorAll("#storymap-embed .vco-menubar-button"),
        );
        const fs = buttons.find((b) => (b.textContent ?? "").includes("Full Screen"));
        return !!fs && fs instanceof HTMLElement && fs.style.display === "none";
    });

    expect(fullscreenHidden).toBe(true);
});
