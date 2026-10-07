import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The accessibility gate (issue #385 wave): the harness, the embed page and
 * the landing page carry no violations of the rules the library claims to
 * meet. Deliberately omitted: `color-contrast`, `region`,
 * `landmark-one-main` — the documented §2 limitations (see
 * docs/plans/issue-385-accessibility.md); including them would make this
 * gate permanently red, which is how a permanently red gate stops being
 * read.
 */
const RULES = [
    "frame-title",
    "image-alt",
    "heading-order",
    "link-name",
    "button-name",
    "aria-hidden-focus",
];

async function expectNoViolations(page: Page, path: string): Promise<void> {
    await page.goto(path);
    // let the widget mount and settle (fonts, tiles, chrome)
    await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page }).withRules(RULES).analyze();
    const violations = results.violations.map((v) => ({
        rule: v.id,
        nodes: v.nodes.map((n) => n.target),
    }));
    expect(violations, `${path}: axe violations`).toEqual([]);
}

test("the harness page passes the claimed axe rules", async ({ page }) => {
    await expectNoViolations(page, "/harness.html?example=katrina");
});

test("the embed prompt page passes the claimed axe rules", async ({ page }) => {
    await expectNoViolations(page, "/embed/index.html");
});

test("the landing page passes the claimed axe rules", async ({ page }) => {
    await expectNoViolations(page, "/");
});
