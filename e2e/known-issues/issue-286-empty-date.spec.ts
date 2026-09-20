import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #286 — "Empty vco-headline-date h3 tag"
 * Every slide renders `<h3 class="vco-headline-date"></h3>` even when the
 * slide has no date. FIXED: the element is only created when the slide has a date,
 * (src/media/types/Text.ts) and left empty. Expected failure until fixed.
 */
test("issue #286: no empty vco-headline-date elements are rendered", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const emptyDates = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#storymap-embed .vco-headline-date")).filter(
            (el) => el.textContent?.trim() === "",
        ).length;
    });
    expect(emptyDates).toBe(0);
});
