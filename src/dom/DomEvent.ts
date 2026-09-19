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

    _checkMouse: function (el: HTMLElement, e: MouseEvent): boolean {
        let related = e.relatedTarget as Node | null;

        if (!related) {
            return true;
        }

        try {
            while (related && related !== el) {
                related = related.parentNode;
            }
        } catch {
            return false;
        }

        return related !== el;
    },

    stopPropagation: function (e: Event): void {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    },

    disableClickPropagation: function (el: HTMLElement): void {
        DomEvent.addListener(el, "mousedown", DomEvent.stopPropagation);
        DomEvent.addListener(el, "click", DomEvent.stopPropagation);
        DomEvent.addListener(el, "dblclick", DomEvent.stopPropagation);
    },

    preventDefault: function (e: Event): void {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    },

    stop: function (e: Event): void {
        DomEvent.preventDefault(e);
        DomEvent.stopPropagation(e);
    },

    getWheelDelta: function (e: WheelEvent): number {
        return -e.deltaY / 40;
    },
};

export { DomEvent };
export type { DomEventTarget };
