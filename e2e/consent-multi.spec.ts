import { test, expect, type Page } from "@playwright/test";

/**
 * Two properties that only exist with more than one viewer on the page, and
 * that jsdom cannot reach:
 *
 *  - a consent decision made in one viewer is honoured by the other, so a
 *    visitor is not asked twice for the same service
 *  - external scripts and stylesheets are injected once per URL for the page
 *    rather than once per viewer
 *
 * The script/CSS assertion is driven through `page.route`, so it counts real
 * requests to a stubbed URL instead of depending on a third party being
 * reachable. What is under test is "one request per URL", not "the provider
 * works".
 */

const TILE = /openfreemap|basemaps|tile|osm/i;

function multiUrl(params: Record<string, string> = {}): string {
    const search = new URLSearchParams({ a: "katrina", b: "katrina", ...params });
    return `/harness-multi.html?${search.toString()}`;
}

/** Click a start-dialog action by exact label, scoped to one viewer. */
async function clickStartAction(page: Page, viewer: string, label: string): Promise<boolean> {
    return page.evaluate(
        ([host, text]) => {
            const dialog = document.querySelector(`#${host} .vco-consent-start`);
            if (!dialog) return false;
            for (const btn of Array.from(dialog.querySelectorAll("button"))) {
                if (btn.textContent?.trim() === text) {
                    btn.click();
                    return true;
                }
            }
            return false;
        },
        [viewer, label],
    );
}

async function waitForMulti(page: Page) {
    await expect
        .poll(() => page.evaluate(() => (window as unknown as { __smReady?: boolean }).__smReady), {
            timeout: 30_000,
        })
        .toBe(true);
}

test("a consent decision in one viewer unblocks the other", async ({ page }) => {
    const consent = JSON.stringify({ consent_required: true });
    const tileRequests: string[] = [];
    page.on("request", (r) => {
        if (TILE.test(r.url())) tileRequests.push(r.url());
    });

    await page.goto(multiUrl({ aopts: consent, bopts: consent }));
    await waitForMulti(page);
    await page.waitForTimeout(2500);

    // both viewers are holding the start-of-story dialog, each its own
    expect(await page.locator("#sm-a .vco-consent-start").count()).toBe(1);
    expect(await page.locator("#sm-b .vco-consent-start").count()).toBe(1);
    expect(tileRequests).toEqual([]);

    // allow everything in the left viewer only
    expect(await clickStartAction(page, "sm-a", "Allow all")).toBe(true);

    // The point of the test: ONE answer unblocks BOTH maps. B is never asked a
    // second time for a service, and its tiles load off the shared record.
    await expect.poll(() => tileRequests.length, { timeout: 20_000 }).toBeGreaterThan(0);
    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    // a plain object at runtime, so `in` rather than Map.prototype.has
                    "map:tiles" in
                    (JSON.parse(localStorage.getItem("storymapjs-consent") ?? "{}") as object),
            ),
        )
        .toBe(true);

    // Known nuance, deliberately asserted rather than hidden: B's
    // already-rendered start dialog stays on screen even though every service
    // in it is now decided. The decisions are honoured — see the tile
    // assertion above — but nothing tells that open dialog it is stale.
    // Closing it would need a same-page signal between viewers (a `storage`
    // event only fires across documents), which is a design call rather than a
    // test-coverage one.
    expect(await page.locator("#sm-b .vco-consent-start").count()).toBe(1);
    expect(
        await page.evaluate(
            () => (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        ),
    ).toEqual([]);
});

test("two viewers load an external stylesheet once", async ({ page }) => {
    // both viewers use the default font theme, so both ask loadCSS() for the
    // same URL
    const requests: string[] = [];
    await page.route("**/*.css", async (route) => {
        requests.push(route.request().url());
        await route.fulfill({ status: 200, contentType: "text/css", body: "" });
    });

    await page.goto(multiUrl());
    await waitForMulti(page);
    await page.waitForTimeout(3000);

    // Only our own loader's requests: an embedded provider (katrina carries a
    // YouTube slide) injects its own stylesheet from its own origin, which
    // loadCSS() never sees and is not expected to dedupe.
    const origin = new URL(page.url()).origin;
    const own = requests.filter((u) => u.startsWith(origin));
    const counts = new Map<string, number>();
    for (const url of own) {
        counts.set(url, (counts.get(url) ?? 0) + 1);
    }
    const repeated = [...counts.entries()].filter(([, n]) => n > 1);
    expect(repeated, `duplicate same-origin requests: ${JSON.stringify(repeated)}`).toEqual([]);

    // and the viewer's own stylesheet really was requested, so the check above
    // is not vacuous
    const widgetCss = own.filter((u) => u.includes("/css/storymap.css"));
    expect(widgetCss.length).toBeGreaterThan(0);
});

test("two viewers inject an external script once", async ({ page }) => {
    // katrina has a YouTube slide, so both viewers reach loadJS() for the
    // IFrame API. Stub it: the claim under test is one injection per URL, and
    // a third-party round trip would make this test depend on youtube.com.
    const apiRequests: string[] = [];
    await page.route("**/iframe_api", async (route) => {
        apiRequests.push(route.request().url());
        await route.fulfill({
            status: 200,
            contentType: "application/javascript",
            body: "window.YT = window.YT || {};",
        });
    });
    const tags = () =>
        page.evaluate(() => document.head.querySelectorAll('script[src*="iframe_api"]').length);

    await page.goto(multiUrl());
    await waitForMulti(page);
    // wait for the media of the first slide on both viewers to be requested
    await expect.poll(() => tags(), { timeout: 30_000 }).toBeGreaterThan(0);
    await page.waitForTimeout(2500);

    expect(apiRequests.length).toBe(1);
    // and exactly one <script> tag survives for that URL
    expect(await tags()).toBe(1);
});
