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
}

export {};
