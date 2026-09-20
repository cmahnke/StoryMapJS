import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #480 — "Handle YouTube Shorts URLs"
 * FIXED: the YouTube id extractor knows /shorts/ URLs.
 */
test("issue #480: a YouTube Shorts url embeds the correct video", async ({ page }) => {
    await page.goto(harnessUrl("issue-480-shorts"));
    await waitForStoryMap(page);

    // the YT iframe API populates the embed src asynchronously
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
                    const iframe = slide?.querySelector(
                        ".vco-media-youtube",
                    ) as HTMLIFrameElement | null;
                    return iframe?.src ?? "";
                }),
            { timeout: 20000 },
        )
        .toContain("yjGBkWXC55w");
});
