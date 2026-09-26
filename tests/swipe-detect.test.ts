import { beforeAll, describe, expect, it } from "vitest";
import Swipable from "../src/ui/Swipable";

/**
 * Gesture detection (iOS swipe fix):
 *
 * - direction follows the *signed* movement, not the absolute screen
 *   position — a rightward swipe that stays on the left half of the
 *   screen (e.g. x 250 → 200) must register as "right", never "left";
 * - touchcancel finishes the gesture exactly once: no leaked
 *   touchmove/mouseleave listeners, no double momentum;
 * - touchend uses changedTouches (touches is empty at touchend), so fast
 *   flicks without an intermediate touchmove still register.
 */
type SwipeEvents = { fired: string[] };

function makeSwipable(): { swipable: Swipable; drag: HTMLElement; events: SwipeEvents } {
    const drag = document.createElement("div");
    document.body.appendChild(drag);
    Object.defineProperty(drag, "offsetWidth", { value: 800 });
    Object.defineProperty(drag, "offsetHeight", { value: 600 });
    const move = document.createElement("div");
    document.body.appendChild(move);
    Object.defineProperty(move, "offsetLeft", { get: () => 0 });
    Object.defineProperty(move, "offsetTop", { get: () => 0 });
    const swipable = new Swipable(drag, move, {
        snap: true,
        enable: { x: true, y: false },
    });
    const events: SwipeEvents = { fired: [] };
    swipable.on("swipe_left", () => events.fired.push("swipe_left"));
    swipable.on("swipe_right", () => events.fired.push("swipe_right"));
    swipable.on("swipe_nodirection", () => events.fired.push("swipe_nodirection"));
    swipable.on("dragend", () => events.fired.push("dragend"));
    swipable.enable();
    return { swipable, drag, events };
}

/** Number of live touchmove listeners stamp-registered on the element. */
function listenerCount(el: HTMLElement): number {
    return Object.keys(el).filter((k) => k.startsWith("_vco_touchmove") && el[k as never]).length;
}

function touch(type: string, x: number, y = 100): TouchEvent {
    const touch = { clientX: x, clientY: y, screenX: x, screenY: y } as Touch;
    const e = new Event(type) as TouchEvent;
    Object.defineProperty(e, "touches", { value: type === "touchend" ? [] : [touch] });
    Object.defineProperty(e, "targetTouches", { value: type === "touchend" ? [] : [touch] });
    Object.defineProperty(e, "changedTouches", { value: [touch] });
    e.preventDefault = () => {};
    return e;
}

describe("swipe gesture detection", () => {
    beforeAll(() => {
        // OpenLayers/jsdom parity with the other widget tests
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    it("registers a leftward swipe as swipe_left", () => {
        const { swipable, drag, events } = makeSwipable();
        drag.dispatchEvent(touch("touchstart", 400));
        drag.dispatchEvent(touch("touchmove", 250));
        drag.dispatchEvent(touch("touchend", 250));
        expect(events.fired).toContain("swipe_left");
        expect(swipable.data.direction).toBe("left");
    });

    it("registers a rightward swipe on the left half as swipe_right (regression)", () => {
        const { swipable, drag, events } = makeSwipable();
        // x 250 → 400: with the old |end| - |start| math this misread as "left"
        drag.dispatchEvent(touch("touchstart", 250));
        drag.dispatchEvent(touch("touchmove", 400));
        drag.dispatchEvent(touch("touchend", 400));
        expect(events.fired).toContain("swipe_right");
        expect(swipable.data.direction).toBe("right");
    });

    it("registers a rightward swipe from a large x as swipe_right", () => {
        const { swipable, drag, events } = makeSwipable();
        drag.dispatchEvent(touch("touchstart", 700));
        drag.dispatchEvent(touch("touchmove", 850));
        drag.dispatchEvent(touch("touchend", 850));
        expect(events.fired).toContain("swipe_right");
        expect(swipable.data.direction).toBe("right");
    });

    it("finishes a touchcancelled gesture exactly once without leaking listeners", () => {
        const { drag, events } = makeSwipable();
        const before = listenerCount(drag);
        drag.dispatchEvent(touch("touchstart", 400));
        drag.dispatchEvent(touch("touchmove", 300));
        drag.dispatchEvent(touch("touchcancel", 300));
        expect(events.fired).toContain("dragend");
        expect(listenerCount(drag)).toBe(before);

        // a duplicate touchend after the cancel must not re-run momentum
        events.fired.length = 0;
        drag.dispatchEvent(touch("touchend", 300));
        expect(events.fired).toEqual([]);

        // the next gesture works normally
        drag.dispatchEvent(touch("touchstart", 400));
        drag.dispatchEvent(touch("touchmove", 250));
        drag.dispatchEvent(touch("touchend", 250));
        expect(events.fired).toContain("swipe_left");
        expect(listenerCount(drag)).toBe(before);
    });

    it("uses changedTouches on touchend for fast flicks without a move", () => {
        const { swipable, drag, events } = makeSwipable();
        drag.dispatchEvent(touch("touchstart", 500));
        // no touchmove: touches is empty at touchend, changedTouches carries
        // the final position
        drag.dispatchEvent(touch("touchend", 200));
        expect(events.fired).toContain("swipe_left");
        expect(swipable.data.direction).toBe("left");
    });

    it("stays silent for tiny movements (no direction)", () => {
        const { swipable, drag, events } = makeSwipable();
        drag.dispatchEvent(touch("touchstart", 400));
        drag.dispatchEvent(touch("touchmove", 403));
        drag.dispatchEvent(touch("touchend", 403));
        // 3px travel × the 2000 momentum multiplier stays below the
        // 10000 direction threshold
        expect(events.fired).not.toContain("swipe_left");
        expect(events.fired).not.toContain("swipe_right");
        expect(swipable.data.direction).toBeNull();
    });
});
