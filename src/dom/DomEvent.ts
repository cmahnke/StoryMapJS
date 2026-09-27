import { stamp } from "../core/Util";

/*	DomEvent
	Inspired by Leaflet
	DomEvent contains functions for working with DOM events.
================================================== */

/** Elements/objects DomEvent listeners can be attached to. */
type DomEventTarget = HTMLElement | Window | Document;

/** Legacy drag handlers historically mixed mouse and touch event surfaces. */
export type LegacyEvent = Event & {
    originalEvent?: TouchEvent;
    targetTouches?: TouchList;
    pageX?: number;
    pageY?: number;
};

/**
 * The wrapper is remembered on the target so `removeListener` can find it
 * again. Keyed by a per-registration counter rather than only by the stamped
 * function: registering the same function twice for the same event used to
 * overwrite the key, leaving the first listener permanently unremovable.
 */
const registrationCounts = new WeakMap<object, number>();

function handlerKey(obj: DomEventTarget, type: string, fn: (e: Event) => void): string {
    const target = obj as object;
    const next = (registrationCounts.get(target) ?? 0) + 1;
    registrationCounts.set(target, next);
    return "_vco_" + type + stamp(fn) + "_" + next;
}

const DomEvent = {
    addListener: function (
        obj: DomEventTarget,
        type: string,
        fn: (e: Event) => void,
        context?: unknown,
    ): void {
        const handler = function (e: Event) {
            return (fn as (this: unknown, e: Event) => void).call(context || obj, e);
        };

        obj.addEventListener(type, handler, false);
        (obj as unknown as Record<string, unknown>)[handlerKey(obj, type, fn)] = handler;
    },

    removeListener: function (
        obj: DomEventTarget,
        type: string,
        fn: (e: Event) => void,
        context?: unknown,
    ): void {
        // The most recent registration for this (type, fn) pair is the one the
        // caller means; walk the counter back to find it.
        const target = obj as unknown as Record<string, unknown>;
        for (let n = registrationCounts.get(obj as object) ?? 0; n > 0; n--) {
            const key = "_vco_" + type + stamp(fn) + "_" + n;
            const handler = target[key];
            if (!handler) {
                continue;
            }
            obj.removeEventListener(type, handler as EventListener, false);
            target[key] = null;
            return;
        }
    },

    preventDefault: function (e: Event): void {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    },
};

export { DomEvent };
export type { DomEventTarget };
