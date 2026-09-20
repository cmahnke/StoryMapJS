import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #375 — "Styles on 'code' make list formatting weird"
 * Lists containing inline <code> elements must render with normal list
 * formatting (items visible, no broken layout).
 */
test("issue #375: inline code inside lists renders normally", async ({ page }) => {
    await page.goto(harnessUrl("issue-375-code-lists"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    const list = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        const items = slide ? Array.from(slide.querySelectorAll("li")) : [];
        const boxes = items.map((li) => li.getBoundingClientRect());
        return {
            count: items.length,
            visible: boxes.every((b) => b.height > 0 && b.width > 0),
            noOverlap: boxes[0].y < boxes[1].y && boxes[1].y < boxes[2].y,
            codeInline: items[0]?.querySelector("code")
                ? getComputedStyle(items[0].querySelector("code")!).display
                : "",
        };
    });

    expect(list.count).toBe(3);
    expect(list.visible).toBe(true);
    expect(list.noOverlap).toBe(true);
    // code should render inline within the list item
    expect(list.codeInline).not.toBe("block");
});
