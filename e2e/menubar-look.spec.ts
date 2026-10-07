import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Menubar buttons keep the pre-0.9.0 Knight Lab look: medium gray text on
 * the light panel (#737373, 4.7:1 on white), a lighter gray under the dark
 * palette where #737373 would fail contrast. Touch target stays 44px.
 */
async function buttonColors(page: import("@playwright/test").Page) {
    return page.evaluate(() => {
        const button = document.querySelector("#storymap-embed .vco-menubar-button") as HTMLElement;
        const cs = getComputedStyle(button);
        return { color: cs.color, background: cs.backgroundColor, minHeight: cs.minHeight };
    });
}

test("menubar buttons use the classic gray on the light palette", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);

    const style = await buttonColors(page);
    expect(style.color).toBe("rgb(115, 115, 115)");
    expect(style.background).toBe("rgb(255, 255, 255)");
    expect(style.minHeight).toBe("44px");
});

test("menubar buttons stay readable on the dark palette", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { theme: "dark" }));
    await waitForStoryMap(page);

    const style = await buttonColors(page);
    expect(style.color).toBe("rgb(179, 179, 179)");
    expect(style.background).toBe("rgb(34, 34, 34)");
});
