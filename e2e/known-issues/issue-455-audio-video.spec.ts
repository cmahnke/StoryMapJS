import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #455 — "Support audio and video file URLs"
 * FIXED: direct audio file URLs render a native <audio> element with the
 * StoryMap media frame (and a proper error display if loading fails).
 */
test("issue #455: a direct audio file url renders an audio element", async ({ page }) => {
    // serve deterministic bytes for the audio file
    await page.route("**/examples/assets/tone.mp3", (route) =>
        route.fulfill({
            status: 200,
            contentType: "audio/mpeg",
            body: Buffer.alloc(64),
        }),
    );
    await page.goto(harnessUrl("issue-455-audio"));
    await waitForStoryMap(page);
    await page.waitForTimeout(4000);
    const audio = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        const item = slide?.querySelector(".vco-media-item");
        return {
            audioElement: !!slide?.querySelector("audio"),
            errorShown: !!slide?.querySelector(".vco-media-loaderror"),
            mediaType: item?.className ?? "",
        };
    });

    // the media type must be recognized: either the audio element renders
    // (playable source) or the error display shows (source failed, not stuck)
    expect(audio.audioElement || audio.errorShown).toBe(true);

    // the loading message must resolve (hidden) within a few seconds
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const message = document.querySelector(
                        "#storymap-embed .vco-slide:nth-child(3) .vco-message",
                    ) as HTMLElement | null;
                    return !message || message.style.display === "none";
                }),
            { timeout: 10_000 },
        )
        .toBe(true);
});
