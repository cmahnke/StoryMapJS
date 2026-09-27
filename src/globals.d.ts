// Externally loaded script globals (YouTube/SoundCloud player APIs).
// Everything the library or the test harness touches on window is typed
// at its usage site instead.

declare global {
    // Externally loaded script globals
    const YT: {
        Player: new (el: HTMLElement | string, opts: unknown) => unknown;
        PlayerState: Record<string, number>;
    };
    const SC: {
        Widget: (el: HTMLElement) => { pause(): void };
    };

    /**
     * The library version, substituted from package.json by the Vite lib build
     * (see the `define` in vite.config.ts). Hard-coded here only so the
     * source type-checks; a dev-server run without the define falls back to
     * "unknown" at runtime via the typeof guard in StoryMap.
     */
    const __STORYMAP_VERSION__: string;
}

export {};
