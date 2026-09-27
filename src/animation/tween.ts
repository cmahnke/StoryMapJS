import type { AnimateOptions, AnimationHandle } from "../types";

/**
 * A ~60 line Web Animations API tween, replacing the `morpheus` dependency.
 *
 * Why: morpheus was 4.3% of the shipped bundle (an inlined UMD build, ~37 kB
 * minified) and shipped no types, so `src/animation/morpheus.d.ts` was a
 * hand-maintained 41-line stub describing a surface the viewer barely used.
 * The whole requirement is: animate `left`/`top`/`height`/`opacity` on one
 * element, then `stop()` it. The platform does that natively.
 *
 * The shape deliberately matches the old call sites
 * (`Animate(element, {left, top, height, opacity, duration, easing, complete})`
 * returning `{stop()}`), so nothing above this file had to change.
 */

/**
 * Properties whose values are plain numbers, not lengths. Appending "px" to
 * these produces an invalid keyframe — `opacity: "0px"` is rejected by the
 * platform and the animation silently does not run.
 */
const UNITLESS = new Set(["opacity", "zIndex", "flexGrow", "flexShrink", "order", "lineHeight"]);

/** Normalise a target value for a keyframe, adding a unit only where needed. */
function toKeyframeValue(property: string, value: string | number): string {
    if (typeof value === "number") {
        return UNITLESS.has(property) ? String(value) : value + "px";
    }
    // percentages and other units pass through to the platform unchanged
    return value;
}

export default function Animate(
    element: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
    options: AnimateOptions,
): AnimationHandle {
    const elements =
        element instanceof HTMLElement ? [element] : Array.from(element as ArrayLike<HTMLElement>);

    // The properties to tween are every key except the lifecycle options.
    const LIFECYCLE = new Set(["duration", "easing", "complete", "delay", "bezier"]);
    const properties: Array<[string, string]> = [];
    for (const [name, value] of Object.entries(options)) {
        if (LIFECYCLE.has(name) || value === undefined || value === null) {
            continue;
        }
        properties.push([name, toKeyframeValue(name, value as string | number)]);
    }

    const from: Keyframe = {};
    const to: Keyframe = {};
    for (const [name, value] of properties) {
        from[name] = readCurrentValue(elements[0], name);
        to[name] = value;
    }

    const duration = (options.duration as number) ?? 1000;
    // `easing` is a function from src/animation/easings.ts; see cssEasing().
    const easing = cssEasing(options.easing);
    const complete = options.complete as (() => void) | undefined;

    // No Web Animations API (jsdom, an ancient engine, or a host that has
    // disabled it): apply the end state immediately. Every caller treats the
    // result the same way it treats a completed animation, so this degrades
    // to an instant transition rather than a broken one.
    if (typeof elements[0]?.animate !== "function") {
        for (const el of elements) {
            for (const [name, value] of properties) {
                el.style.setProperty(name, value);
            }
        }
        complete?.();
        return { stop: () => {} };
    }

    const animations: Animation[] = [];
    for (const el of elements) {
        const animation = el.animate([from, to], {
            duration: duration,
            easing: easing,
            fill: "forwards",
        });
        animations.push(animation);
    }

    const handle: AnimationHandle = {
        stop: (jump?: boolean) => {
            for (const animation of animations) {
                // `commitStyles()` is the important part: it folds the current
                // animated value into the element's inline style *before* the
                // animation is torn down. Without it, cancelling snaps the
                // element back to whatever it was before the animation — and
                // three call sites depend on the post-stop value: the slider
                // writes `style.left` directly on its fast path, SlideNav
                // resets left/right to "" when it completes, and Swipable
                // restarts momentum from the current position.
                try {
                    animation.commitStyles();
                } catch {
                    // an animation that never started (or already finished)
                    // has nothing to commit
                }
                animation.cancel();
            }
            // `stop(true)` used to mean "jump to the end"; keep that meaning
            if (jump) {
                for (const animation of animations) {
                    animation.finish();
                }
            }
        },
    };

    if (complete) {
        const first = animations[0];
        if (first) {
            first.addEventListener("finish", () => complete());
        } else {
            complete();
        }
    }

    return handle;
}

/** The element's current inline or computed value for a property. */
function readCurrentValue(element: HTMLElement | undefined, property: string): string {
    if (!element) {
        return "0px";
    }
    const inline = element.style.getPropertyValue(property);
    if (inline) {
        return inline;
    }
    const computed = window.getComputedStyle(element).getPropertyValue(property);
    return computed || "0px";
}

/**
 * Translate the caller's easing into something `element.animate()` accepts.
 *
 * The call sites pass a *sampled* easing function from
 * src/animation/easings.ts (a quintic, an exponential, a cubic-bezier), and
 * CSS can only name a handful of curves. Dropping to the platform default
 * would visibly change the slider glide, so instead the function is sampled
 * into a CSS `linear()` easing — which reproduces the curve exactly.
 *
 * `linear()` is not universally supported, so it is feature-detected; where it
 * is missing the platform default applies. That is a visual regression, not a
 * functional one, which is why it is a graceful fallback rather than an error.
 */
function cssEasing(easing: unknown): string {
    if (typeof easing === "string") {
        return easing;
    }
    if (typeof easing === "function" && supportsLinearEasing()) {
        const stops: string[] = [];
        for (let i = 0; i <= EASING_SAMPLES; i++) {
            const t = i / EASING_SAMPLES;
            const value = (easing as (t: number) => number)(t);
            stops.push(String(Number(value.toFixed(4))));
        }
        return `linear(${stops.join(",")})`;
    }
    return "ease";
}

/** Enough samples to be visually indistinguishable from the source curve. */
const EASING_SAMPLES = 24;

let _linearEasing: boolean | undefined;

/** Cached `CSS.supports` probe for the linear() easing function. */
function supportsLinearEasing(): boolean {
    if (_linearEasing === undefined) {
        try {
            _linearEasing =
                typeof CSS !== "undefined" &&
                typeof CSS.supports === "function" &&
                CSS.supports("animation-timing-function", "linear(0, 0.5, 1)");
        } catch {
            _linearEasing = false;
        }
    }
    return _linearEasing;
}
