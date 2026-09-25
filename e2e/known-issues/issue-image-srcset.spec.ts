import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * Responsive image sizes (perf): author-provided `srcset`/`sizes` pass
 * through to the img element; IIIF image URLs request container-matched
 * widths; plain URLs render byte-identically.
 */
test("srcset and sizes pass through to the img element", async ({ page }) => {
    await page.goto(harnessUrl("issue-image-srcset"));
    await waitForStoryMap(page);

    // media builds asynchronously (1200ms load delay)
    await expect
        .poll(() =>
            page.evaluate(() => {
                const img = document.querySelector("#storymap-embed img.vco-media-image");
                return img ? img.getAttribute("srcset") : null;
            }),
        )
        .toContain("480w");

    const attrs = await page.evaluate(() => {
        const img = document.querySelector("#storymap-embed img.vco-media-image");
        return img
            ? { srcset: img.getAttribute("srcset"), sizes: img.getAttribute("sizes") }
            : null;
    });
    expect(attrs?.srcset).toContain("1024w");
    expect(attrs?.sizes).toBe("50vw");
});

test("plain image URLs render byte-identically", async ({ page }) => {
    await page.goto(harnessUrl("issue-451-webp"));
    await waitForStoryMap(page);

    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    document
                        .querySelector("#storymap-embed img.vco-media-image")
                        ?.getAttribute("src") ?? null,
            ),
        )
        .toContain(".webp");

    // no IIIF pattern, no size rewrite — the fixture URL unchanged
    const src = await page.evaluate(() =>
        document.querySelector("#storymap-embed img.vco-media-image")?.getAttribute("src"),
    );
    expect(src).not.toMatch(/\/\d+,\/|\/full\/\d+,/);
});
