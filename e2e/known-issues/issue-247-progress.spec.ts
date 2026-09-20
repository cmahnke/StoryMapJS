import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #247 — "progress indicator"
 * FIXED: the show_progress option renders a progress bar in the menubar that
 * tracks the current slide (with ARIA attributes).
 */
test("issue #247: the progress bar tracks the current slide", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide", { show_progress: true }));
    await waitForStoryMap(page);
    await page.waitForTimeout(1000);

    const start = await page.evaluate(() => {
        const bar = document.querySelector(
            "#storymap-embed .vco-menubar-progress",
        ) as HTMLElement | null;
        const fill = document.querySelector(
            "#storymap-embed .vco-menubar-progress-fill",
        ) as HTMLElement | null;
        return {
            present: !!bar,
            width: fill?.style.width ?? "",
            aria: bar?.getAttribute("aria-valuenow") ?? "",
        };
    });
    expect(start.present).toBe(true);
    expect(start.width).toBe("0%");
    expect(start.aria).toBe("1");

    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(4),
    );

    // the progress updates when the slide change completes
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const fill = document.querySelector(
                        "#storymap-embed .vco-menubar-progress-fill",
                    ) as HTMLElement | null;
                    return fill?.style.width ?? "";
                }),
            { timeout: 10000 },
        )
        .toBe("100%");

    const end = await page.evaluate(() => {
        const fill = document.querySelector(
            "#storymap-embed .vco-menubar-progress-fill",
        ) as HTMLElement | null;
        const bar = document.querySelector("#storymap-embed .vco-menubar-progress");
        return { width: fill?.style.width ?? "", aria: bar?.getAttribute("aria-valuenow") ?? "" };
    });
    expect(end.width).toBe("100%");
    expect(end.aria).toBe("5");
});

test("issue #247: no progress bar by default", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);

    const count = await page.evaluate(
        () => document.querySelectorAll("#storymap-embed .vco-menubar-progress").length,
    );
    expect(count).toBe(0);
});
