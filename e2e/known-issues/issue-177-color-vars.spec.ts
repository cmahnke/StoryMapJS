import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #177 — "Allow custom text color(s)"
 * FIXED: the `text_color` option sets the `--vco-color-text` custom property
 * on the container; slide typography consumes it. `text_background_color`
 * overrides the slide panel background.
 */
test("issue #177: text_color option drives the css variable", async ({ page }) => {
    await page.goto(
        harnessUrl("issue-177-color-vars", {
            text_color: "rgb(0, 255, 0)",
            text_background_color: "rgb(20, 30, 40)",
        }),
    );
    await waitForStoryMap(page);

    const container = page.locator(".vco-storymap");
    await expect(container).toHaveCSS("--vco-color-text", "rgb(0, 255, 0)");

    // the paragraph color resolves through the variable
    const pColor = await page
        .locator(".vco-text p")
        .first()
        .evaluate((el) => getComputedStyle(el).color);
    expect(pColor).toBe("rgb(0, 255, 0)");

    // the slide background is overridden
    const bg = await page
        .locator(".vco-slide-background")
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(20, 30, 40)");
});
