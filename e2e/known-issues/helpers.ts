import { expect, type Page } from "@playwright/test";

/** Wait until the harness has created the StoryMap instance. */
export async function waitForStoryMap(page: Page) {
    await expect
        .poll(() => page.evaluate(() => (window as unknown as { __smReady?: boolean }).__smReady), {
            timeout: 30_000,
        })
        .toBe(true);
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
