import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #358 — "Can't embed additional media"
 * PARTIAL: extra iframe media renders sanitized inside the slide text
 * field (migration path for removed media types); a full multi-media
 * layout is still out of scope.
 */
test("issue #358: an iframe snippet in slide text renders sanitized", async ({ page }) => {
    await page.goto(harnessUrl("issue-358-iframe"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    const src = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        const iframe = slide?.querySelector(".vco-text-content iframe") as HTMLIFrameElement | null;
        return iframe?.getAttribute("src") ?? "";
    });
    expect(src).toBe("https://example.com/embed/123");
});

test("issue #358: scripts, handlers and javascript: urls in text never execute", async ({
    page,
}) => {
    await page.goto(harnessUrl("issue-358-iframe"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    const state = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[2];
        return {
            xssFlag: (window as unknown as { __smXss358?: boolean }).__smXss358 ?? false,
            scripts: slide?.querySelectorAll("script").length ?? -1,
            iframes: slide?.querySelectorAll(".vco-text-content iframe").length ?? -1,
            handlers: slide ? slide.querySelectorAll("[onclick]").length : -1,
            linkHref: (
                slide?.querySelector(".vco-text-content a") as HTMLAnchorElement | null
            )?.getAttribute("href"),
        };
    });

    expect(state.xssFlag).toBe(false);
    expect(state.scripts).toBe(0);
    expect(state.iframes).toBe(0);
    expect(state.handlers).toBe(0);
    expect(state.linkHref ?? "").not.toContain("javascript:");
});
