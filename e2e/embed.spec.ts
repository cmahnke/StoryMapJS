import { test, expect } from "@playwright/test";

// The embed page exercises the built UMD bundle through the KLStoryMap global
// (the classic script-tag consumption path for published storymaps).
test("embed page renders a storymap via the KLStoryMap global", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto("/embed/index.html?url=/examples/katrina.json");

    await expect
        .poll(
            () =>
                page.evaluate(() => document.querySelectorAll("#storymap-embed .vco-slide").length),
            {
                timeout: 20_000,
                message: "waiting for slides to render",
            },
        )
        .toBeGreaterThan(0);

    expect(pageErrors, "uncaught exceptions on the embed page").toEqual([]);
});
