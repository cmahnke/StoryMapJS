import { test, expect } from "@playwright/test";

/**
 * The embed page must also work on the DEV server (npm run dev, :8000),
 * where the built bundle (../js/storymap.js) does not exist — the page
 * falls back to importing the source entry, which brings the widget styles
 * along. Regression: the page used to render blank (module 404) in dev.
 */
test("embed page renders on the dev server via the source fallback", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto("http://localhost:8500/embed/index.html?url=examples%2Fnightwatch.json");

    await expect
        .poll(
            () =>
                page.evaluate(() => document.querySelectorAll("#storymap-embed .vco-slide").length),
            { timeout: 45_000, message: "waiting for slides to render" },
        )
        .toBeGreaterThan(0);

    // the source fallback injects the widget styles (vite bundles the SCSS)
    const styled = await page.evaluate(() =>
        document.querySelector("#storymap-embed")?.classList.contains("vco-storymap"),
    );
    expect(styled).toBe(true);
    expect(pageErrors).toEqual([]);
});
