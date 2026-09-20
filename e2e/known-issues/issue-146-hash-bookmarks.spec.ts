import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #146 — "Hash Bookmarks" (merged with #305 "Default Slide /
 * Hash Bookmarks")
 * Enhancement: deep-linking a slide via the URL hash (e.g. #slide-3) is not
 * implemented. start_at_slide itself works (see issue-305 spec).
 */
test.fixme("issue #146: URL hash bookmark jumps to the referenced slide", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide") + "#slide-3");
    await waitForStoryMap(page);
    await expect
        .poll(
            () =>
                page.evaluate(
                    () =>
                        (window as unknown as { __sm?: { current_slide: number } }).__sm!
                            .current_slide,
                ),
            { timeout: 5_000 },
        )
        .toBe(3);
});
