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
        (obj as unknown as Record<string, unknown>)["_vco_" + type + stamp(fn)] = handler;
    },

    removeListener: function (
        obj: DomEventTarget,
        type: string,
        fn: (e: Event) => void,
        context?: unknown,
    ): void {
        const key = "_vco_" + type + stamp(fn);
        const handler = (obj as unknown as Record<string, unknown>)[key];

        if (!handler) {
            return;
        }

        obj.removeEventListener(type, handler as EventListener, false);
        (obj as unknown as Record<string, unknown>)[key] = null;
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
