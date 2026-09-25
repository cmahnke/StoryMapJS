import { test, expect } from "@playwright/test";

/**
 * Accessibility: the embed player must not disable pinch-zoom (WCAG 1.4.4
 * — the viewport meta has no maximum-scale).
 */
test("the embed page allows zooming", async ({ page }) => {
    await page.goto("/embed/index.html?url=examples%2Fkatrina.json");
    const viewport = await page.evaluate(() =>
        document.querySelector('meta[name="viewport"]')?.getAttribute("content"),
    );
    expect(viewport).not.toContain("maximum-scale");
    expect(viewport).not.toContain("user-scalable=no");
});
