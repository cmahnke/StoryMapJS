import Animate from "../animation/tween";
import { easeInOutQuint, easeOutStrong } from "../animation/easings";
import { Browser } from "../core/Browser";
import { Evented, type EventedInstance } from "../core/mixins";
import { mergeData } from "../core/Util";
import { DomEvent, type LegacyEvent } from "../dom/DomEvent";
import type { AnimateOptions, AnimationHandle } from "../types";

/*    Swipable
    Adds drag/swipe capabilities to an element, with momentum on release.
================================================== */

/**
 * Clamp `value` into `[min, max]`. Either bound may be `false` (unset) or a
 * number; `0` is a real bound, so this tests for a number rather than
 * truthiness.
 */
function clampAxis(value: number, min: number | boolean, max: number | boolean): number {
    if (typeof max === "number" && value > max) {
        return max;
    }
    if (typeof min === "number" && value < min) {
        return min;
    }
    return value;
}

interface DragEventNames {
    down: string;
    up: string;
    cancel?: string;
    leave: string;
    move: string;
}

interface SwipableOptions {
    snap: boolean;
    enable: { x: boolean; y: boolean };
    constraint: {
        top: number | boolean;
        bottom: number | boolean;
        left: number | boolean;
        right: number | boolean;
    };
    momentum_multiplier: number;
    duration: number;
    ease: unknown;
}

interface DragData {
    sliding: boolean;
    direction: SwipeDirection | null;
    pagex: { start: number; end: number };
    pagey: { start: number; end: number };
    pos: { start: { x: number; y: number }; end: { x: number; y: number } };
    new_pos: { x: number; y: number };
    new_pos_parent: { x: number; y: number };
    time: { start: number; end: number };
    touch: boolean;
}

/** The four swipe directions. `"none"` is not one: an undecided gesture
 *  carries `null`, and the truthiness guard at the fire site treats it as
 *  "no swipe" rather than a fifth direction. */
export type SwipeDirection = "left" | "right" | "up" | "down";

export interface SwipableEvents {
    dragstart: DragData;
    dragend: DragData;
    dragmove: DragData;
    momentum: DragData;
    swipe_left: DragData;
    swipe_right: DragData;
    swipe_up: DragData;
    swipe_down: DragData;
    swipe_nodirection: DragData;
}

class SwipableBase {
    declare "mousedrag": DragEventNames;
    declare "touchdrag": DragEventNames;
    declare "_el": Record<string, HTMLElement>;
    declare "options": SwipableOptions;
    declare "animator": AnimationHandle | null;
    declare "dragevent": DragEventNames;
    declare "data": DragData;
    declare "fire": EventedInstance<SwipableEvents>["fire"];

    //_el: {},

    constructor(
        drag_elem: HTMLElement,
        move_elem?: HTMLElement,
        options?: Record<string, unknown>,
    ) {
        this.mousedrag = {
            down: "mousedown",
            up: "mouseup",
            leave: "mouseleave",
            move: "mousemove",
        };
        this.touchdrag = {
            down: "touchstart",
            up: "touchend",
            cancel: "touchcancel",
            leave: "mouseleave",
            move: "touchmove",
        };
        // DOM ELements
        this._el = {
            drag: drag_elem,
            move: drag_elem,
        };
        if (move_elem) {
            this._el.move = move_elem;
        }
        //Options
        this.options = {
            snap: false,
            enable: {
                x: true,
                y: true,
            },
            constraint: {
                top: false,
                bottom: false,
                left: 0,
                right: false,
            },
            momentum_multiplier: 2000,
            duration: 1000,
            ease: easeInOutQuint,
        };
        // Animation Object
        this.animator = null;
        // Drag Event Type
        this.dragevent = this.mousedrag;
        if (Browser.touch) {
            this.dragevent = this.touchdrag;
        }
        // Draggable Data
        this.data = {
            sliding: false,
            direction: null,
            pagex: {
                start: 0,
                end: 0,
            },
            pagey: {
                start: 0,
                end: 0,
            },
            pos: {
                start: {
                    x: 0,
                    y: 0,
                },
                end: {
                    x: 0,
                    y: 0,
                },
            },
            new_pos: {
                x: 0,
                y: 0,
            },
            new_pos_parent: {
                x: 0,
                y: 0,
            },
            time: {
                start: 0,
                end: 0,
            },
            touch: false,
        };
        // Merge Data and Options
        mergeData(this.options, options);
    }

    enable(e?: LegacyEvent): void {
        DomEvent.addListener(this._el.drag, this.dragevent.down, this._onDragStart, this);
        DomEvent.addListener(this._el.drag, this.dragevent.up, this._onDragEnd, this);
        // iOS fires touchcancel when the browser claims the gesture (page
        // scroll): without it, touchend never runs and the move/leave
        // listeners registered in _onDragStart leak on every cancelled touch
        if (this.dragevent === this.touchdrag && this.touchdrag.cancel) {
            DomEvent.addListener(this._el.drag, this.touchdrag.cancel, this._onDragEnd, this);
        }
        // reset the dragged element to its origin. `pos.start` used to be
        // assigned the *number* 0 and then read as `pos.start.x`, which is
        // undefined — so this wrote `left: "undefinedpx"`.
        this.data.pos.start = { x: 0, y: 0 };
        this._el.move.style.left = this.data.pos.start.x + "px";
        this._el.move.style.top = this.data.pos.start.y + "px";
        this._el.move.style.position = "absolute";
        //this._el.move.style.zIndex = "11";
        //this._el.move.style.cursor = "move";
    }

    disable() {
        DomEvent.removeListener(this._el.drag, this.dragevent.down, this._onDragStart, this);
        DomEvent.removeListener(this._el.drag, this.dragevent.up, this._onDragEnd, this);
        if (this.dragevent === this.touchdrag && this.touchdrag.cancel) {
            DomEvent.removeListener(this._el.drag, this.touchdrag.cancel, this._onDragEnd, this);
        }
    }

    /**
     * Full teardown for `dispose()`: `disable()` only covers the listeners
     * `enable()` adds, but a gesture in flight also holds the `move`/`leave`
     * pair plus the momentum animation.
     */
    dispose() {
        this.stopMomentum();
        this.disable();
        DomEvent.removeListener(this._el.drag, this.dragevent.move, this._onDragMove, this);
        DomEvent.removeListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
    }

    stopMomentum() {
        if (this.animator) {
            this.animator.stop();
        }
    }

    updateConstraint(c: SwipableOptions["constraint"]): void {
        this.options.constraint = c;
        // Temporary until issues are fixed
    }

    /*    Private Methods
    ================================================== */
    _onDragStart(e: LegacyEvent) {
        // an in-flight momentum animation must not fight the new gesture
        if (this.animator) {
            this.animator.stop();
        }
        // guard against duplicate move/leave listeners when a previous
        // gesture never ended (e.g. a touchcancel before the fix) — an
        // in-flight gesture is restarted from the new touch position
        if (this.data.sliding) {
            this._detachGestureListeners();
        }
        if (Browser.touch) {
            const touch = e.originalEvent
                ? e.originalEvent.touches[0]
                : e.targetTouches
                  ? e.targetTouches[0]
                  : null;
            this.data.pagex.start = touch ? touch.clientX : (e.pageX ?? 0);
            this.data.pagey.start = touch ? touch.clientY : (e.pageY ?? 0);
        } else {
            this.data.pagex.start = e.pageX ?? 0;
            this.data.pagey.start = e.pageY ?? 0;
        }
        this.data.sliding = true;
        // Center element to finger or mouse
        if (this.options.enable.x) {
            //this._el.move.style.left = this.data.pagex.start - (this._el.move.offsetWidth / 2) + "px";
        }
        if (this.options.enable.y) {
            //this._el.move.style.top = this.data.pagey.start - (this._el.move.offsetHeight / 2) + "px";
        }
        this.data.pos.start = { x: this._el.move.offsetLeft, y: this._el.move.offsetTop };
        this.data.time.start = Date.now();
        this.fire("dragstart", this.data);
        this._attachGestureListeners();
    }

    _onDragEnd(e: LegacyEvent) {
        // touchcancel/touchend may arrive without a move, or twice (touchend
        // after touchcancel): record the position and finish exactly once
        const was_sliding = this.data.sliding;
        if (Browser.touch && was_sliding) {
            const touch = e.originalEvent
                ? (e.originalEvent.changedTouches[0] ?? e.originalEvent.touches[0])
                : null;
            if (touch) {
                this.data.pagex.end = touch.clientX;
                this.data.pagey.end = touch.clientY;
            }
        } else if (!Browser.touch && was_sliding) {
            this.data.pagex.end = e.pageX ?? this.data.pagex.end;
            this.data.pagey.end = e.pageY ?? this.data.pagey.end;
        }
        this.data.sliding = false;
        this._detachGestureListeners();
        if (!was_sliding) {
            return;
        }
        this.fire("dragend", this.data);
        this._momentum();
    }

    _attachGestureListeners(): void {
        DomEvent.addListener(this._el.drag, this.dragevent.move, this._onDragMove, this);
        DomEvent.addListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
    }

    _detachGestureListeners(): void {
        DomEvent.removeListener(this._el.drag, this.dragevent.move, this._onDragMove, this);
        DomEvent.removeListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
    }

    _onDragMove(e: LegacyEvent) {
        const change = {
            x: 0,
            y: 0,
        };
        //e.preventDefault();
        this.data.sliding = true;
        if (Browser.touch) {
            const touch = e.originalEvent
                ? e.originalEvent.touches[0]
                : e.targetTouches
                  ? e.targetTouches[0]
                  : null;
            this.data.pagex.end = touch ? touch.clientX : (e.pageX ?? this.data.pagex.end);
            this.data.pagey.end = touch ? touch.clientY : (e.pageY ?? this.data.pagey.end);
        } else {
            this.data.pagex.end = e.pageX ?? this.data.pagex.end;
            this.data.pagey.end = e.pageY ?? this.data.pagey.end;
        }
        // signed gesture deltas: direction must follow the movement, not the
        // absolute screen position (|end| - |start| misread rightward swipes
        // that stay on the left half of the screen as "left")
        change.x = this.data.pagex.end - this.data.pagex.start;
        change.y = this.data.pagey.end - this.data.pagey.start;
        this.data.pos.end = { x: this.data.pos.start.x, y: this.data.pos.start.y };
        this.data.new_pos.x = this.data.pos.start.x - change.x;
        this.data.new_pos.y = this.data.pos.start.y - change.y;
        if (this.options.enable.x && Math.abs(change.x) > Math.abs(change.y)) {
            e.preventDefault();
            this._el.move.style.left = this.data.new_pos.x + "px";
        }
        if (this.options.enable.y && Math.abs(change.y) > Math.abs(change.x)) {
            e.preventDefault();
            this._el.move.style.top = this.data.new_pos.y + "px";
        }
        this.fire("dragmove", this.data);
    }

    _momentum() {
        const pos_adjust = {
                x: 0,
                y: 0,
                time: 0,
            },
            pos_change = {
                x: 0,
                y: 0,
                time: 0,
            },
            swipe_detect = {
                x: false,
                y: false,
            };
        let swipe = false;
        this.data.direction = null;
        // signed travel distance of the gesture (px), scaled by speed
        pos_change.x =
            this.options.momentum_multiplier * (this.data.pagex.end - this.data.pagex.start);
        pos_change.y =
            this.options.momentum_multiplier * (this.data.pagey.end - this.data.pagey.start);
        pos_change.time = (Date.now() - this.data.time.start) * 10;
        pos_adjust.x = Math.round(pos_change.x / Math.max(pos_change.time, 1));
        pos_adjust.y = Math.round(pos_change.y / Math.max(pos_change.time, 1));
        this.data.new_pos.x = this.data.pos.start.x + pos_adjust.x;
        this.data.new_pos.y = this.data.pos.start.y + pos_adjust.y;
        if (!this.options.enable.x) {
            this.data.new_pos.x = this.data.pos.start.x;
        }
        if (!this.options.enable.y) {
            this.data.new_pos.y = this.data.pos.start.y;
        }
        // Detect Swipe
        if (pos_change.time < 2000) {
            swipe = true;
        }
        if (this.options.enable.x && this.options.enable.y) {
            if (Math.abs(pos_change.x) > Math.abs(pos_change.y)) {
                swipe_detect.x = true;
            } else {
                swipe_detect.y = true;
            }
        } else if (this.options.enable.x) {
            if (Math.abs(pos_change.x) > Math.abs(pos_change.y)) {
                swipe_detect.x = true;
            }
        } else {
            if (Math.abs(pos_change.y) > Math.abs(pos_change.x)) {
                swipe_detect.y = true;
            }
        }
        // Detect Direction and long swipe
        if (swipe_detect.x) {
            // Long Swipe
            if (
                Math.abs(this.data.pagex.end - this.data.pagex.start) >
                this._el.drag.offsetWidth / 2
            ) {
                swipe = true;
            }
            if (Math.abs(pos_change.x) > 10000) {
                // leftward finger travel (end < start) pulls the next slide
                // into view → "left"; rightward travel goes back → "right"
                this.data.direction =
                    this.data.pagex.end < this.data.pagex.start ? "left" : "right";
            }
        }
        if (swipe_detect.y) {
            // Long Swipe
            if (
                Math.abs(this.data.pagey.end - this.data.pagey.start) >
                this._el.drag.offsetHeight / 2
            ) {
                swipe = true;
            }
            if (Math.abs(pos_change.y) > 10000) {
                this.data.direction = this.data.pagey.end < this.data.pagey.start ? "up" : "down";
            }
        }
        this._animateMomentum();
        const direction = this.data.direction;
        if (swipe && direction) {
            this.fire(`swipe_${direction}`, this.data);
        } else if (direction) {
            this.fire("swipe_nodirection", this.data);
        } else if (this.options.snap) {
            this.animator?.stop();
            this.animator = Animate(this._el.move, {
                top: this.data.pos.start.y,
                left: this.data.pos.start.x,
                duration: this.options.duration,
                easing: easeOutStrong,
            });
        }
    }

    _animateMomentum() {
        const pos = {
            x: this.data.new_pos.x,
            y: this.data.new_pos.y,
        };
        const animate: AnimateOptions = {
            duration: this.options.duration,
            easing: easeOutStrong,
        };
        // Clamp the resting position into the configured range. Each bound is
        // optional and defaults to `false`, so test for a number rather than
        // truthiness (0 is a meaningful bound). The x pair was inverted —
        // `left` was treated as the maximum and `right` as the minimum — so a
        // real horizontal constraint snapped every momentum animation to the
        // left edge.
        if (this.options.enable.y) {
            pos.y = clampAxis(pos.y, this.options.constraint.top, this.options.constraint.bottom);
            animate.top = Math.floor(pos.y) + "px";
        }
        if (this.options.enable.x) {
            pos.x = clampAxis(pos.x, this.options.constraint.left, this.options.constraint.right);
            animate.left = Math.floor(pos.x) + "px";
        }
        this.animator = Animate(this._el.move, animate);
        this.fire("momentum", this.data);
    }
}

export default class Swipable extends Evented<SwipableEvents, typeof SwipableBase>(SwipableBase) {
    constructor(...args: ConstructorParameters<typeof SwipableBase>) {
        super(...args);
    }
}
