import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #451 — "Support webp images"
 * FIXED: the image matcher includes webp, so .webp URLs render as images.
 */
test("issue #451: a .webp media url renders as an image", async ({ page }) => {
    await page.goto(harnessUrl("issue-451-webp"));
    await waitForStoryMap(page);

    // the media element is created asynchronously
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
                    return !!slide?.querySelector("img.vco-media-item");
                }),
            { timeout: 15000 },
        )
        .toBe(true);

    const media = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        const img = slide?.querySelector("img.vco-media-item");
        return {
            isImage:
                !!img &&
                (img.className.includes("vco-media-image") || img.getAttribute("src") !== null),
            isIframe: !!slide?.querySelector(".vco-media-item iframe, .vco-media-website"),
            src: img?.getAttribute("src") ?? "",
        };
    });

    expect(media.isImage).toBe(true);
    expect(media.src).toContain(".webp");
    expect(media.isIframe).toBe(false);
});
