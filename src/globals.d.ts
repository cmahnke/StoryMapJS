// Transitional global API kept for backwards compatibility with embeds.
// The main entry assigns these at runtime.

type StoryMapConstructor = typeof import("./storymap/StoryMap").StoryMap;
type StoryMapInstance = InstanceType<StoryMapConstructor>;

declare global {
    interface Window {
        KLStoryMap: {
            StoryMap: StoryMapConstructor;
            loadCSS: (url: string, cb?: () => void) => void;
        };
        VCO: {
            Load: { css: (url: string, cb?: () => void) => void };
            getJSON: (url: string, onload: (data: unknown) => void) => void;
            StoryMap: StoryMapConstructor;
        };
        trace: (msg: unknown) => void;
        storymap?: StoryMapInstance;
        __smReady?: boolean;
        __smErrors?: string[];
        __sm?: unknown;
        L_NO_TOUCH?: boolean | string;
    }
}

declare global {
    // Externally loaded script globals
    const YT: {
        Player: new (el: HTMLElement | string, opts: unknown) => unknown;
        PlayerState: Record<string, number>;
    };
    const moment: (date: string, format?: string) => { fromNow: () => string };
    const SC: {
        Widget: (el: HTMLElement) => { pause(): void };
    };
}

export {};
