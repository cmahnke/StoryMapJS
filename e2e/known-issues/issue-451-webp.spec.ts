import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #451 — "Support webp images"
 * STILL APPLIES: the image matcher only knows jpg|jpeg|png|gif, so a .webp
 * URL falls through to the generic website type and renders an iframe
 * instead of an image. Expected failure until webp is added to the matcher.
 */
test.fail("issue #451: a .webp media url renders as an image", async ({ page }) => {
    await page.goto(harnessUrl("issue-451-webp"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2000);

    const media = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        return {
            isImage: !!slide?.querySelector(".vco-media-image img, .vco-media-item img"),
            isIframe: !!slide?.querySelector(".vco-media-item iframe, .vco-media-website"),
        };
    });

    expect(media.isImage).toBe(true);
    expect(media.isIframe).toBe(false);
});
