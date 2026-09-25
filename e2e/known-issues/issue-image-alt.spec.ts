import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * Accessibility: slide images carry alt text — explicit `alt`, falling
 * back to the caption as plain text; IIIF manifests round-trip the
 * `storymap:mediaAlt` term.
 */
test("explicit alt text reaches the img element", async ({ page }) => {
    await page.goto(harnessUrl("issue-image-alt"));
    await waitForStoryMap(page);

    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    document
                        .querySelector("#storymap-embed img.vco-media-image")
                        ?.getAttribute("alt") ?? null,
            ),
        )
        .toBe("Portrait-oriented placeholder photograph");
});

test("a missing alt falls back to the caption as plain text", async ({ page }) => {
    await page.goto(harnessUrl("issue-image-srcset"));
    await waitForStoryMap(page);

    // the srcset fixture has no alt; its caption is plain text
    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    document
                        .querySelector("#storymap-embed img.vco-media-image")
                        ?.getAttribute("alt") ?? null,
            ),
        )
        .toBe("srcset passthrough");
});
