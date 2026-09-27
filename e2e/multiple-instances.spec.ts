import { test, expect, type Page } from "@playwright/test";

/**
 * Two viewers on one page. The viewer's UI strings and a few DOM lookups used
 * to be page-wide, so a second instance either repainted the first in the
 * wrong language, measured its map against the other's slide panel, or
 * adopted its slide element ids.
 */
function multiUrl(params: Record<string, string> = {}): string {
    // both documents need several slides: the navigation assertions below
    // cannot distinguish "did not move" from "was already at the end"
    const search = new URLSearchParams({ a: "katrina", b: "seurat", ...params });
    return `/harness-multi.html?${search.toString()}`;
}

async function waitForMulti(page: Page) {
    await expect
        .poll(() => page.evaluate(() => (window as unknown as { __smReady?: boolean }).__smReady), {
            timeout: 30_000,
        })
        .toBe(true);
}

async function errors(page: Page): Promise<string[]> {
    return page.evaluate(() => (window as unknown as { __smErrors?: string[] }).__smErrors ?? []);
}

test.describe("multiple viewers on one page", () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
    });

    test("both viewers render, independently", async ({ page }) => {
        await page.goto(multiUrl());
        await waitForMulti(page);
        await page.waitForTimeout(2500);

        for (const id of ["sm-a", "sm-b"]) {
            const host = page.locator(`#${id}`);
            await expect(host.locator(".vco-map")).toBeVisible();
            await expect(host.locator(".vco-storyslider")).toBeVisible();
            // The map really painted, so the two ol instances coexist. Assert
            // the presence of a canvas rather than a count: the minimap adds
            // one of its own, and it is built lazily, so the total is 1 or 2
            // depending on the document and the viewport.
            await expect(host.locator("canvas").first()).toBeAttached({ timeout: 30_000 });
        }
        // each has its own slide panel, and the counts can differ because
        // they are different documents
        expect(await page.locator("#sm-a .vco-slide").count()).toBeGreaterThan(0);
        expect(await page.locator("#sm-b .vco-slide").count()).toBeGreaterThan(0);

        expect(await errors(page)).toEqual([]);
    });

    test("navigating one viewer leaves the other where it was", async ({ page }) => {
        await page.goto(multiUrl());
        await waitForMulti(page);
        await page.waitForTimeout(2500);

        const slideOf = (id: string) =>
            page.evaluate((host) => {
                const sm = (window as unknown as Record<string, { current_slide: number }>)[
                    "__sm" + (host === "sm-a" ? "A" : "B")
                ];
                return sm.current_slide;
            }, id);

        expect(await slideOf("sm-b")).toBe(0);
        // Advance only the left viewer. The click is dispatched rather than
        // positioned: with map_area "full" the map covers the right half of
        // the page, which is exactly where the slider's right edge — and so
        // the next arrow — sits, so a hit-tested click lands on the map's
        // overlay container instead of the arrow.
        await page.locator("#sm-a .vco-slidenav-next").dispatchEvent("click");
        await page.waitForTimeout(1200);

        expect(await slideOf("sm-a")).toBe(1);
        expect(await slideOf("sm-b")).toBe(0);
    });

    test("arrow keys drive only the viewer the visitor just used", async ({ page }) => {
        // keyboard is opt-in, and both viewers have to opt in for this to
        // mean anything
        const keyboard = JSON.stringify({ keyboard: true });
        await page.goto(multiUrl({ aopts: keyboard, bopts: keyboard }));
        await waitForMulti(page);
        await page.waitForTimeout(2500);

        const slideOf = (host: string) =>
            page.evaluate((h) => {
                const sm = (window as unknown as Record<string, { current_slide: number }>)[
                    "__sm" + (h === "sm-a" ? "A" : "B")
                ];
                return sm.current_slide;
            }, host);

        expect(await slideOf("sm-a")).toBe(0);
        expect(await slideOf("sm-b")).toBe(0);

        // Interact with the RIGHT viewer, deliberately not the one whose
        // window listener was registered first, then hand focus back to the
        // body. The blur matters: while a viewer's slider holds focus, its own
        // keydown handler calls preventDefault() and the sibling's
        // `defaultPrevented` guard is inert, which made the focused case look
        // correct by accident. With focus on the body, ownership used to fall
        // to whichever handler ran first — registration order — so a visitor
        // who had just used the second viewer could not drive it with arrows.
        await page.locator("#sm-b .vco-storyslider").click({ position: { x: 5, y: 5 } });
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
        await page.waitForTimeout(300);
        expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("BODY");

        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(1200);

        expect(await slideOf("sm-b")).toBe(1);
        expect(await slideOf("sm-a")).toBe(0);

        // and interacting with the left one hands it over
        await page.locator("#sm-a .vco-storyslider").click({ position: { x: 5, y: 5 } });
        await page.waitForTimeout(300);
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(1200);

        expect(await slideOf("sm-a")).toBe(1);
        expect(await slideOf("sm-b")).toBe(1);
    });

    test("element ids are unique across both viewers", async ({ page }) => {
        // shared=1 builds both viewers from ONE parsed document object, which
        // is how an SPA renders two stories from a single payload
        await page.goto(multiUrl({ shared: "1" }));
        await waitForMulti(page);
        await page.waitForTimeout(2500);

        const duplicates = await page.evaluate(() => {
            const ids = [...document.querySelectorAll("[id]")]
                .map((el) => el.id)
                .filter((id) => id !== "");
            return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
        });
        expect(duplicates).toEqual([]);

        // and the slides really do carry generated ids
        const slideIds = await page.evaluate(() =>
            [...document.querySelectorAll(".vco-slide")].map((el) => el.id),
        );
        expect(slideIds.length).toBeGreaterThan(1);
        for (const id of slideIds) {
            expect(id.startsWith("vco-slide-")).toBe(true);
        }
    });

    test("disposing one viewer leaves the other working", async ({ page }) => {
        await page.goto(multiUrl());
        await waitForMulti(page);
        await page.waitForTimeout(2500);

        await page.evaluate(() => {
            (window as unknown as { __smA: { dispose(): void } }).__smA.dispose();
        });
        await page.waitForTimeout(500);

        // A is emptied and terminal
        await expect(page.locator("#sm-a")).toHaveCount(1);
        expect(await page.locator("#sm-a .vco-storyslider").count()).toBe(0);
        expect(await page.evaluate(() => document.getElementById("sm-a")!.children.length)).toBe(0);

        // B is untouched, still painted, and still navigates
        await expect(page.locator("#sm-b .vco-storyslider")).toBeVisible({ timeout: 30_000 });
        await expect(page.locator("#sm-b canvas").first()).toBeAttached({ timeout: 30_000 });
        await page.evaluate(() => {
            (window as unknown as { __smB: { goTo(n: number): void } }).__smB.goTo(1);
        });
        await page.waitForTimeout(1200);
        const slide = await page.evaluate(
            () => (window as unknown as { __smB: { current_slide: number } }).__smB.current_slide,
        );
        expect(slide).toBe(1);
        expect(await errors(page)).toEqual([]);
    });

    test("two viewers in the same language both render it", async ({ page }) => {
        const german = JSON.stringify({ language: "de" });
        await page.goto(multiUrl({ aopts: german, bopts: german }));
        await waitForMulti(page);
        await page.waitForTimeout(2500);

        const labels = await page.evaluate(() => {
            const read = (id: string) =>
                document.querySelector(`#${id} .vco-menubar-button`)?.textContent?.trim() ?? null;
            return { a: read("sm-a"), b: read("sm-b") };
        });
        expect(labels.a).toBe("Kartenübersicht");
        expect(labels.b).toBe(labels.a);
        expect(await errors(page)).toEqual([]);
    });

    test("a conflicting second language is reported, not silently mismatched", async ({ page }) => {
        // A claims German; B asks for French. The UI strings are one page-wide
        // binding, so this is a configuration error and must be reported
        // rather than letting the last one set silently repaint A.
        await page.goto(
            multiUrl({
                aopts: JSON.stringify({ language: "de" }),
                bopts: JSON.stringify({ language: "fr" }),
            }),
        );
        await waitForMulti(page);
        await page.waitForTimeout(2500);

        const reported = await errors(page);
        expect(reported.join("\n")).toMatch(/different languages/);
        // A still renders correctly
        const label = await page.evaluate(
            () => document.querySelector("#sm-a .vco-menubar-button")?.textContent?.trim() ?? null,
        );
        expect(label).toBe("Kartenübersicht");
    });
});
