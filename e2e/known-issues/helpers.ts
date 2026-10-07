import { expect, type Page } from "@playwright/test";

/** Wait until the harness has created the StoryMap instance. */
export async function waitForStoryMap(page: Page) {
    await expect
        .poll(() => page.evaluate(() => (window as unknown as { __smReady?: boolean }).__smReady), {
            timeout: 30_000,
        })
        .toBe(true);
}

/**
 * Park the virtual mouse over the map, clear of the chrome, and drop focus
 * to the page body. A fresh Playwright page starts its pointer at the
 * viewport origin — the menubar's top-left corner — so without this any
 * `getComputedStyle` read of the first menubar button measures `:hover`
 * (white text / theme background) instead of the resting look, but only
 * when the page is focused (i.e. CI, not a backgrounded local window).
 */
export async function clearHover(page: Page) {
    await page.mouse.move(640, 400);
    await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    });
}

/** Navigate the harness to an example (optionally with options overrides). */
export function harnessUrl(example: string, options?: unknown): string {
    const params = new URLSearchParams({ example });
    if (options !== undefined) {
        params.set("options", JSON.stringify(options));
    }
    return `/harness.html?${params.toString()}`;
}

/** Collect uncaught page errors. */
export function collectPageErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    return errors;
}

export interface StoryMapState {
    errors: string[];
    currentSlide: number;
    slideCount: number;
}

/** Snapshot the current harness state. */
export async function getState(page: Page): Promise<StoryMapState> {
    return page.evaluate(() => ({
        errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        currentSlide: (window as unknown as { __sm?: { current_slide: number } }).__sm
            ? (window as unknown as { __sm: { current_slide: number } }).__sm.current_slide
            : -1,
        slideCount: document.querySelectorAll("#storymap-embed .vco-slide").length,
    }));
}

/** Any base-tile host the viewer might pick. */
export const TILE_HOST = /openfreemap|basemaps|osm|tile/i;

/**
 * Intercept a tile host with a 1x1 transparent PNG, so a spec that is about
 * something other than imagery does not depend on reaching the public tile
 * service.
 *
 * This is not only about the network being down. The viewer's `loaded` used to
 * wait for OpenLayers' first `loadend` — the first paint of the base tiles — so
 * a slow or unreachable tile host delayed, or silently swallowed, work that had
 * nothing to do with tiles. That is fixed in the source; stubbing here keeps
 * these specs from inheriting the same dependency at all.
 */
export async function stubTiles(page: Page): Promise<string[]> {
    const seen: string[] = [];
    const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
    );
    await page.route(TILE_HOST, async (route) => {
        seen.push(route.request().url());
        await route.fulfill({ status: 200, contentType: "image/png", body: png });
    });
    return seen;
}
