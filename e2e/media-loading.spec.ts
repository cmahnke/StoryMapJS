import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap, collectPageErrors } from "./known-issues/helpers";

/**
 * Regression guard for the image media type.
 *
 * `Image._loadMedia()` has to finish with `onLoaded()`. That one call hides
 * the `.vco-message` loading overlay and runs `showMeta()`, so when the call
 * drifted to a dead position inside `_altText()` every image slide kept a
 * permanent "Loading Image" spinner painted over the image (z-index 99) and
 * never rendered its credit or caption.
 *
 * The audio/video suite already asserts the overlay resolves
 * (`known-issues/issue-455-audio-video.spec.ts`); this covers images, which
 * are the most common media type in the fixtures.
 */
test("an image slide hides the loading overlay and renders its credit", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto(harnessUrl("instagram_couch"));
    await waitForStoryMap(page);

    const image = page.locator("#storymap-embed .vco-slide:first-child img.vco-media-image");
    await expect(image).toBeVisible();

    // the overlay must resolve (hidden) once the image is built
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const message = document.querySelector(
                        "#storymap-embed .vco-slide:first-child .vco-message",
                    ) as HTMLElement | null;
                    return !message || message.style.display === "none";
                }),
            { timeout: 15_000 },
        )
        .toBe(true);

    // showMeta() runs, so the credit from the fixture is rendered
    await expect(page.locator("#storymap-embed .vco-slide:first-child .vco-credit")).toHaveCount(1);

    expect(errors).toEqual([]);
});
