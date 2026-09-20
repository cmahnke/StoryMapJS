import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #244 — "Text alignment"
 * FIXED: the text_align option (storymap-wide, per-slide via text.text_align)
 * aligns slide text left, center or right.
 */
test("issue #244: text_align centers slide text", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync", { text_align: "center" }));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    const aligned = await page.evaluate(() => {
        const containers = document.querySelectorAll(
            "#storymap-embed .vco-text-content-container.vco-text-align-center",
        );
        const first = document.querySelector(
            "#storymap-embed .vco-text-content-container",
        ) as HTMLElement | null;
        return {
            count: containers.length,
            computed: first ? getComputedStyle(first).textAlign : "",
        };
    });
    expect(aligned.count).toBeGreaterThan(0);
    expect(aligned.computed).toBe("center");
});

test("issue #244: text defaults to left alignment", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    const aligned = await page.evaluate(() => {
        const count = document.querySelectorAll(
            "#storymap-embed .vco-text-align-center, #storymap-embed .vco-text-align-right",
        ).length;
        const first = document.querySelector(
            "#storymap-embed .vco-text-content-container",
        ) as HTMLElement | null;
        return { count, computed: first ? getComputedStyle(first).textAlign : "" };
    });
    expect(aligned.count).toBe(0);
    expect(["left", "start"]).toContain(aligned.computed);
});
