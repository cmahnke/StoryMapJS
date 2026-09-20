import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #480 — "Handle YouTube Shorts URLs"
 * STILL APPLIES: the URL is recognized as YouTube but the video id extraction
 * (`/v/|v=|youtu.be/`) does not know `/shorts/<id>`, so the player embeds an
 * invalid id. Expected failure until the extraction learns Shorts.
 */
test.fail("issue #480: a YouTube Shorts url embeds the correct video", async ({ page }) => {
    await page.goto(harnessUrl("issue-480-shorts"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const media = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        const iframe = slide?.querySelector("iframe") as HTMLIFrameElement | null;
        const item = slide?.querySelector(".vco-media-youtube");
        return {
            isYouTube: !!item,
            iframeSrc: iframe?.src ?? "",
        };
    });

    expect(media.isYouTube).toBe(true);
    // the shorts id must reach the player embed
    expect(decodeURIComponent(media.iframeSrc)).toContain("yjGBkWXC55w");
});
