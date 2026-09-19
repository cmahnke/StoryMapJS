// Type declarations for the morpheus animation library (https://github.com/ded/morpheus)
declare module "morpheus" {
    interface MorpheusOptions extends Record<string, unknown> {
        duration?: number;
        easing?: unknown;
        complete?: unknown;
        bezier?: number[][];
        left?: string | number;
        top?: string | number;
    }

    interface MorpheusHandle {
        stop: (jump?: boolean) => void;
    }

    interface Morpheus {
        (elements: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>, options: MorpheusOptions): MorpheusHandle;
        tween(
            this: unknown,
            duration: number,
            fn: (pos: number) => void,
            done?: () => void,
            ease?: ((t: number) => number) | string,
            from?: number,
            to?: number
        ): MorpheusHandle;
        getStyle(el: HTMLElement, property: string): unknown;
        bezier(points: number[][], pos: number): number[];
        transform: string;
        parseTransform(style: string, base?: Record<string, number>): Record<string, number>;
        formatTransform(values: Record<string, number>): string;
        animationFrame(callback: (timestamp: number) => void): number;
        easings: Record<string, (t: number) => number>;
    }

    const morpheus: Morpheus;
    export = morpheus;
}
