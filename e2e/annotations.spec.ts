import { expect, test, type Page } from "@playwright/test";

/**
 * Annotation-driven tour stops: a manifest whose commenting, tagging,
 * classifying or describing annotations carry a fragment target renders one
 * slide per annotation, each fitting the region it points at. Fixture:
 * public/examples-iiif/annotated-image.json (a single canvas presented as an
 * image map, with four stops). Documented in docs/iiif-authoring.md.
 */

/** One canvas, which becomes the overview slide, plus four stops. */
const SLIDE_COUNT = 5;

async function openFixture(page: Page) {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(String(e)));
    await page.goto("/harness.html?manifest=annotated-image");
    await expect
        .poll(() => page.evaluate(() => (window as unknown as { __smReady?: boolean }).__smReady), {
            timeout: 30_000,
        })
        .toBe(true);
    return pageErrors;
}

test("annotation stops become slides after their canvas", async ({ page }) => {
    const pageErrors = await openFixture(page);

    const state = await page.evaluate(() => ({
        errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        slides: Array.from(document.querySelectorAll("#storymap-embed .vco-slide")).map((s) => ({
            headline: s.querySelector(".vco-headline")?.textContent?.trim() ?? null,
            paragraphs: s.querySelectorAll(".vco-text-content-container p").length,
        })),
    }));

    expect(pageErrors, "uncaught exceptions").toEqual([]);
    expect(state.errors, "window errors").toEqual([]);
    expect(state.slides, "one canvas slide plus four stops").toHaveLength(SLIDE_COUNT);

    // the canvas slide is the overview and comes first; then the stops in
    // annotation order. A stop whose annotation has no label has no headline
    // at all — and must not inherit a placeholder (issue fixed in Text.ts)
    expect(state.slides.map((s) => s.headline)).toEqual([
        "The sculpture",
        null,
        "The lower group",
        null,
        null,
    ]);
});

test("a text/plain stop body becomes one paragraph per block", async ({ page }) => {
    await openFixture(page);

    const paragraphs = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[1];
        return Array.from(slide.querySelectorAll(".vco-text-content-container p")).map(
            (p) => p.textContent?.trim() ?? "",
        );
    });
    expect(paragraphs).toEqual([
        "First paragraph of the stop.",
        "Second paragraph, separated by a blank line.",
    ]);
});

test("a text/html stop body keeps its markup", async ({ page }) => {
    await openFixture(page);

    const html = await page.evaluate(() => {
        const slide = document.querySelectorAll("#storymap-embed .vco-slide")[2];
        return {
            emphasis: slide.querySelector(".vco-text-content-container em")?.textContent ?? null,
            text: slide.querySelector(".vco-text-content-container")?.textContent?.trim() ?? null,
        };
    });
    expect(html.emphasis, "<em> survived the html body").toBe("inscription");
    expect(html.text).toContain("Lower group");
});

test("each stop carries the region its target points at", async ({ page }) => {
    await openFixture(page);

    const regions = await page.evaluate(() => {
        const sm = (window as unknown as { __sm: { data: { slides: unknown[] } } }).__sm;
        return sm.data.slides.map((s) => {
            const loc = (s as { location?: { region?: number[] } }).location;
            return loc?.region ?? null;
        });
    });
    expect(regions[0], "the canvas slide has no region").toBeNull();
    expect(regions[1]).toEqual([700, 300, 900, 900]);
    expect(regions[2]).toEqual([120, 1500, 1100, 900]);
    expect(regions[3]).toEqual([150, 2200, 700, 700]);
    // a PointSelector at (1150, 1500) became a 5% square of the canvas's
    // smaller side (5% of 2315 = 116), centred and clamped
    expect(regions[4]).toEqual([1092, 1442, 116, 116]);
});

test("navigating to a stop fits the view to its region", async ({ page }) => {
    await openFixture(page);
    // the fly-to is animated; the settled extent is what matters
    await page.waitForTimeout(2500);

    const extentAt = async (n: number) => {
        await page.evaluate((i) => {
            (window as unknown as { __sm?: { goTo(k: number): void } }).__sm?.goTo(i);
        }, n);
        await page.waitForTimeout(2500);
        return page.evaluate(() => {
            const sm = (
                window as unknown as {
                    __sm?: {
                        map?: {
                            getView(): { calculateExtent(s: number[]): number[] };
                            getSize(): number[];
                        };
                    };
                }
            ).__sm;
            const map = sm?.map;
            if (!map) return null;
            return map.getView().calculateExtent(map.getSize());
        });
    };

    // stop 1: region [700, 300, 900, 900]. The fitted extent covers the
    // region; the viewport may add margin, so assert containment.
    const stop1 = await extentAt(1);
    expect(stop1).not.toBeNull();
    expect(stop1![0]).toBeLessThanOrEqual(701);
    expect(stop1![1]).toBeLessThanOrEqual(301);
    expect(stop1![2]).toBeGreaterThanOrEqual(1599);
    expect(stop1![3]).toBeGreaterThanOrEqual(1199);

    // stop 3: region [150, 2200, 700, 700]
    const stop3 = await extentAt(3);
    expect(stop3).not.toBeNull();
    expect(stop3![0]).toBeLessThanOrEqual(151);
    expect(stop3![1]).toBeLessThanOrEqual(2201);
    expect(stop3![2]).toBeGreaterThanOrEqual(849);
    expect(stop3![3]).toBeGreaterThanOrEqual(2899);
});

test("a Sound body becomes slide media, resolved to the native audio type", async ({ page }) => {
    await openFixture(page);

    // What the converter produced: the Sound body's id is the slide media url,
    // and nothing else on the stop invents media.
    const media = await page.evaluate(() => {
        const sm = (window as unknown as { __sm: { data: { slides: unknown[] } } }).__sm;
        return sm.data.slides.map((s) => (s as { media?: { url?: string } }).media?.url ?? null);
    });
    expect(media[3]).toBe("https://example.org/audio/inscription.mp3");
    expect(media[1], "a text-only stop has no media").toBeNull();

    // The viewer then resolves that url through MediaType() to the native
    // player, and media is loaded lazily for the current slide and its
    // neighbours, so navigate to the stop first.
    await page.evaluate(() => {
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(3);
    });
    const resolved = await page
        .locator("#storymap-embed .vco-slide")
        .nth(3)
        .locator(".vco-media, .vco-media-content-container")
        .first();
    await expect(resolved).toBeVisible({ timeout: 20_000 });
    const type = await page.evaluate(() => {
        const slides = (
            window as unknown as {
                __sm: { _storyslider: { _slides: Record<string, unknown>[] } };
            }
        ).__sm._storyslider._slides;
        const media = slides[3]._media as
            { options?: { media_type?: string; media_name?: string } } | undefined;
        return { type: media?.options?.media_type, name: media?.options?.media_name };
    });
    expect(type).toEqual({ type: "audio", name: "Audio" });
});
