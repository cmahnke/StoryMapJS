import { test, expect } from "@playwright/test";
import { clearHover, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Menubar buttons keep the pre-0.9.0 Knight Lab look: medium gray text on
 * the light panel (#737373, 4.7:1 on white), a lighter gray under the dark
 * palette where #737373 would fail contrast. 14px bold, 6px/12px padding,
 * separators on every button but the first, label vertically centered in
 * the 44px touch target.
 *
 * The typeface/size/weight/padding assertions pin a real cascade bug: the
 * ported normalize reset (`.vco-storymap button`, 0,1,1) outranks a bare
 * `.vco-menubar-button` (0,1,0) and used to zero all of these.
 */
async function buttonStyle(page: import("@playwright/test").Page, index: number) {
    return page.evaluate((i) => {
        const buttons = [
            ...document.querySelectorAll("#storymap-embed .vco-menubar-button"),
        ] as HTMLElement[];
        const button = buttons[i];
        if (button.matches(":hover") || button.matches(":focus-visible")) {
            throw new Error(
                `menubar button ${i} is hovered or focused; styles would read the interactive state`,
            );
        }
        const cs = getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(button);
        const text = range.getBoundingClientRect();
        return {
            color: cs.color,
            background: cs.backgroundColor,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
            borderLeft: cs.borderLeftWidth,
            height: Math.round(rect.height),
            topGap: Math.round(text.top - rect.top),
            bottomGap: Math.round(rect.bottom - text.bottom),
        };
    }, index);
}

test("menubar buttons use the classic look on the light palette", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);
    await clearHover(page);

    const first = await buttonStyle(page, 0);
    expect(first.color).toBe("rgb(115, 115, 115)");
    expect(first.background).toBe("rgb(255, 255, 255)");
    expect(first.fontSize).toBe("14px");
    expect(first.fontWeight).toBe("700");
    expect(first.padding).toBe("6px 12px 6px 12px");
    expect(first.borderLeft).toBe("0px");
    expect(first.height).toBe(44);
    expect(Math.abs(first.topGap - first.bottomGap)).toBeLessThanOrEqual(2);

    // non-first buttons carry the 1px separator
    const second = await buttonStyle(page, 1);
    expect(second.borderLeft).toBe("1px");
    expect(second.height).toBe(44);
});

test("menubar buttons stay readable on the dark palette", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { theme: "dark" }));
    await waitForStoryMap(page);
    await clearHover(page);

    const style = await buttonStyle(page, 0);
    expect(style.color).toBe("rgb(179, 179, 179)");
    expect(style.background).toBe("rgb(34, 34, 34)");
});
