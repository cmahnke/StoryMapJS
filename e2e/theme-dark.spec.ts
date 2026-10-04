import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap, getState } from "./known-issues/helpers";

/**
 * Dark theme (`theme: "dark"`): the container carries
 * `data-vco-theme="dark"` and the palette resolves to dark values —
 * proving the dark block is reached, not merely declared.
 */
test("theme dark repaints the widget palette", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { theme: "dark" }));
    await waitForStoryMap(page);

    const theme = await page.evaluate(() => {
        const container = document.querySelector("#storymap-embed.vco-storymap") as HTMLElement;
        const cs = getComputedStyle(container);
        return {
            attr: container.getAttribute("data-vco-theme"),
            background: cs.getPropertyValue("--vco-color-background").trim(),
            text: cs.getPropertyValue("--vco-color-text").trim(),
            theme: cs.getPropertyValue("--vco-color-theme").trim(),
        };
    });
    expect(theme.attr).toBe("dark");
    expect(theme.background).toBe("#222");
    expect(theme.text).toBe("#949494");
    expect(theme.theme).toBe("#dd735a");

    const state = await getState(page);
    expect(state.errors).toEqual([]);
    expect(state.slideCount).toBeGreaterThan(0);
});

test("explicit light pins the palette under a dark OS", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(harnessUrl("katrina", { theme: "light" }));
    await waitForStoryMap(page);

    const background = await page.evaluate(() => {
        const container = document.querySelector("#storymap-embed.vco-storymap") as HTMLElement;
        return getComputedStyle(container).getPropertyValue("--vco-color-background").trim();
    });
    expect(background).toBe("#fff");
});

test("unset theme follows the OS color scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);

    const theme = await page.evaluate(() => {
        const container = document.querySelector("#storymap-embed.vco-storymap") as HTMLElement;
        return {
            attr: container.getAttribute("data-vco-theme"),
            background: getComputedStyle(container)
                .getPropertyValue("--vco-color-background")
                .trim(),
        };
    });
    // no pinned attribute, but the media query still applies the palette
    expect(theme.attr).toBeNull();
    expect(theme.background).toBe("#222");
});
