import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #272 — "Facebook embeds"
 * FIXED: Facebook post/video/reel URLs render through the plugins endpoint.
 */
test("issue #272: a Facebook url renders the plugins embed", async ({ page }) => {
    await page.goto(harnessUrl("issue-272-facebook"));
    await waitForStoryMap(page);

    // media elements are created asynchronously (1200ms load delay)
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const slides = document.querySelectorAll("#storymap-embed .vco-slide");
                    return [slides[1], slides[2]].map((slide) => {
                        const iframe = slide?.querySelector(
                            ".vco-media-facebook iframe",
                        ) as HTMLIFrameElement | null;
                        return iframe?.src ?? "";
                    });
                }),
            { timeout: 15000 },
        )
        .toMatchObject([
            expect.stringContaining("facebook.com/plugins/post.php"),
            expect.stringContaining("facebook.com/plugins/video.php"),
        ]);
});

/**
 * KNOWN ISSUE #437 — "DocumentCloud media type"
 * FIXED: DocumentCloud document URLs render the viewer embed.
 */
test("issue #437: a DocumentCloud url renders the viewer", async ({ page }) => {
    await page.goto(harnessUrl("issue-437-documentcloud"));
    await waitForStoryMap(page);

    const readSrc = () =>
        page.evaluate(() => {
            const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
            const iframe = slide?.querySelector(
                ".vco-media-documentcloud iframe",
            ) as HTMLIFrameElement | null;
            return iframe?.src ?? "";
        });
    await expect.poll(readSrc, { timeout: 15000 }).toContain("documentcloud.org");

    expect(await readSrc()).toContain("documentcloud.org/documents/1234567-sample-document.html");
});

/**
 * KNOWN ISSUE #360 — "JuxtaposeJS media type"
 * FIXED: Juxtapose URLs render the before/after frame.
 */
test("issue #360: a Juxtapose url renders the frame", async ({ page }) => {
    await page.goto(harnessUrl("issue-360-juxtapose"));
    await waitForStoryMap(page);

    const readSrc = () =>
        page.evaluate(() => {
            const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
            const iframe = slide?.querySelector(
                ".vco-media-juxtapose iframe",
            ) as HTMLIFrameElement | null;
            return iframe?.src ?? "";
        });
    await expect.poll(readSrc, { timeout: 15000 }).toContain("juxtapose.knightlab.com/frame/");
});
