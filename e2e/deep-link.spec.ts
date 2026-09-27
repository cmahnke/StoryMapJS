import { test, expect } from "@playwright/test";
import { harnessUrl, stubTiles, waitForStoryMap } from "./known-issues/helpers";

/**
 * A deep link is applied while the viewer is still loading — the URL no longer
 * waits for the map, so there is nothing long to wait for beyond building the
 * story. A 10s budget is generous; the tile host is stubbed, so the previous
 * 30s was only ever covering a stalled `loadend`, which is what made this look
 * intermittent instead of broken.
 */
const PATIENT = { timeout: 10_000 } as const;

/** A IIIF manifest fixture. `?example=` would be the storymap-JSON instead. */
const manifestUrl = (name: string) => `/harness.html?manifest=${name}`;

/**
 * A manifest with plenty of canvases. `iiif-wellcome` has exactly one, so
 * indexing into its slides is a good way to get nulls for the wrong reason.
 */
const MULTI = "instagram_joegermuska";

/**
 * Deep links by stop identity rather than by position (§5.1 of
 * docs/plans/iiif-interop.md). A manifest's canvas ids are the canonical
 * identifiers (§2.3), so a link to "this stop" has to survive a slide being
 * inserted above it — which an index cannot. The `iiif-content` parameter is
 * the IIIF Content State 1.0 spelling, so a link opened in a different IIIF
 * viewer lands in the same place.
 *
 * `page.evaluate` serialises its function into the page, so the viewer is
 * reached through the same `window.__sm` cast every time rather than through a
 * helper defined out here.
 */

/** In the page: the current slide index. */
const CURRENT = () => (window as unknown as { __sm: { current_slide: number } }).__sm.current_slide;

/** In the page: a slide's id, defaulting to the current one. */
const SLIDE_ID = (index: number) =>
    (window as unknown as { __sm: { getSlideId(i?: number): string | null } }).__sm.getSlideId(
        index,
    );

const GO_TO = (n: number) =>
    (window as unknown as { __sm: { goTo(n: number): void } }).__sm.goTo(n);

// Neither the deep link nor the URL sync has anything to do with imagery, so
// these specs stub the tile host rather than depend on reaching it.
test.beforeEach(async ({ page }) => {
    await stubTiles(page);
});

test("a manifest's canvas id is emitted as the hash and as iiif-content", async ({ page }) => {
    await page.goto(manifestUrl(MULTI));
    await waitForStoryMap(page);

    await page.evaluate(GO_TO, 2);
    // the stop's own identity, not its position
    const expected = await page.evaluate(SLIDE_ID, 2);
    expect(expected, "the manifest supplies a uniqueid per canvas").toBeTruthy();

    await expect
        .poll(() => page.evaluate(() => window.location.hash))
        .toBe(`#slide-${encodeURI(expected as string)}`);

    // and the standard parameter, naming the same canvas
    const contentState = await page.evaluate(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get("iiif-content");
    });
    // a whole canvas is a plain, unencoded target URI (content state §2.2.4)
    expect(contentState).toBe(expected);
});

test("a link naming a canvas id opens that slide", async ({ page }) => {
    await page.goto(manifestUrl(MULTI));
    await waitForStoryMap(page);
    const id = await page.evaluate(SLIDE_ID, 3);
    expect(id).toBeTruthy();

    // straight to the URL, with no hash at all
    await page.goto(`${manifestUrl(MULTI)}&iiif-content=${encodeURIComponent(id as string)}`);
    await waitForStoryMap(page);

    await expect.poll(() => page.evaluate(CURRENT), PATIENT).toBe(3);
});

test("an iiif-content naming a region opens that slide", async ({ page }) => {
    await page.goto(manifestUrl(MULTI));
    await waitForStoryMap(page);
    const id = await page.evaluate(SLIDE_ID, 1);
    expect(id, "the canvas the region belongs to").toBeTruthy();

    // a region cannot be a bare URI (content state §2.2.5), so it is the
    // encoded Target Body: encodeURIComponent, base64url, no padding
    const encoded = await page.evaluate((canvas) => {
        const target = { id: `${canvas as string}#xywh=10,20,30,40`, type: "Canvas" };
        return btoa(encodeURIComponent(JSON.stringify(target)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
    }, id);
    await page.goto(`${manifestUrl(MULTI)}&iiif-content=${encoded}`);
    await waitForStoryMap(page);

    await expect.poll(() => page.evaluate(CURRENT), PATIENT).toBe(1);
    // and it is kept in the URL as we navigate on
    await expect
        .poll(() => page.evaluate(() => window.location.search.includes("iiif-content")))
        .toBe(true);
});

test("the index form of the hash still works", async ({ page }) => {
    // links shared before ids were emitted must keep resolving
    await page.goto(harnessUrl("katrina") + "#slide-2");
    await waitForStoryMap(page);
    await expect.poll(() => page.evaluate(CURRENT), PATIENT).toBe(2);
});

test("a storymap-JSON slide has no identity, so it keeps the index form", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);
    await page.evaluate(GO_TO, 2);

    // inventing a linkable id from a random one would be worse than none
    await expect.poll(() => page.evaluate(() => window.location.hash), PATIENT).toBe("#slide-2");
    await expect
        .poll(() => page.evaluate(() => new URLSearchParams(location.search).get("iiif-content")))
        .toBeNull();
});

test("a content state naming a canvas we do not have warns and stays put", async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (m) => {
        if (m.type() === "warning") warnings.push(m.text());
    });
    await page.goto(
        `${manifestUrl(MULTI)}&iiif-content=${encodeURIComponent("https://example.org/nope")}`,
    );
    await waitForStoryMap(page);

    await expect.poll(() => page.evaluate(CURRENT), PATIENT).toBe(0);
    await expect
        .poll(() => warnings.filter((w) => w.includes("content state")).length)
        .toBeGreaterThan(0);
});

test("the change payload names the stop, not just the position", async ({ page }) => {
    await page.goto(manifestUrl(MULTI));
    await waitForStoryMap(page);

    const payload = await page.evaluate(
        () =>
            new Promise<{ current_slide: number; current_id: string | null }>((resolve) => {
                const sm = (
                    window as unknown as {
                        __sm: {
                            on(type: string, fn: (e: unknown) => void): void;
                            goTo(n: number): void;
                        };
                    }
                ).__sm;
                sm.on("change", (e) =>
                    resolve(e as { current_slide: number; current_id: string | null }),
                );
                sm.goTo(2);
            }),
    );

    expect(payload.current_slide).toBe(2);
    // a host can tell which stop it is on, so a link or a citation survives a
    // slide being inserted above it
    expect(payload.current_id).toBeTruthy();
});
