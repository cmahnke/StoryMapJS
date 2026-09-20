import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #452 — "Remove or update CSS zoom property"
 * FIXED: the stylesheets no longer use the non-standard `zoom` property.
 */
test("issue #452: stylesheets contain no zoom property", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const zoomRules = await page.evaluate(() => {
        const found: string[] = [];
        for (const sheet of Array.from(document.styleSheets)) {
            let rules: CSSRuleList;
            try {
                rules = sheet.cssRules;
            } catch {
                continue; // cross-origin stylesheets are opaque
            }
            const walk = (list: CSSRuleList) => {
                for (let i = 0; i < list.length; i++) {
                    const rule = list[i] as CSSStyleRule & { cssRules?: CSSRuleList };
                    if (rule.cssRules) {
                        walk(rule.cssRules);
                    }
                    if (rule.style) {
                        for (let p = 0; p < rule.style.length; p++) {
                            const prop = rule.style[p];
                            if (prop === "zoom") {
                                found.push(rule.selectorText ?? rule.cssText.slice(0, 60));
                            }
                        }
                    }
                }
            };
            walk(rules);
        }
        return found;
    });

    expect(zoomRules).toEqual([]);
});
