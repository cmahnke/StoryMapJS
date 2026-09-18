// Transitional global API kept for backwards compatibility with embeds.
// The main entry assigns these at runtime.

declare global {
    interface Window {
        KLStoryMap: any;
        VCO: any;
        trace: (msg: unknown) => void;
        storymap?: unknown;
        __smReady?: boolean;
        __smErrors?: string[];
        __sm?: unknown;
        L_NO_TOUCH?: boolean | string;
    }
}

declare global {
    // Externally loaded script globals
    const YT: any;
    const moment: any;
    const SC: any;
}

export {};

export {};
