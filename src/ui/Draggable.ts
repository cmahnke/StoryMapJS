import { mergeData } from "../core/Util";
import { Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import { DomEvent, type LegacyEvent } from "../dom/DomEvent";
import { touch } from "../core/Browser";
import Ease from "../animation/Ease";
import Animate from "morpheus";
import type { AnimateOptions, AnimationHandle } from "../types";

/*	Draggable
	Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
	TODO Enable constraints
================================================== */

interface DragEventNames {
    down: string;
    up: string;
    leave: string;
    move: string;
}

interface DraggableOptions {
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
    direction: string | null;
    pagex: { start: number; end: number };
    pagey: { start: number; end: number };
    pos: { start: { x: number; y: number }; end: { x: number; y: number } };
    new_pos: { x: number; y: number };
    new_pos_parent: { x: number; y: number };
    time: { start: number; end: number };
    touch: boolean;
}

export class DraggableBase {
    declare "_el": Record<string, HTMLElement>;
    declare "options": DraggableOptions;
    declare "animator": AnimationHandle | null;
    declare "dragevent": DragEventNames;
    declare "data": DragData;
    declare "fire": EventedInstance["fire"];

    mousedrag = {
        down: "mousedown",
        up: "mouseup",
        leave: "mouseleave",
        move: "mousemove",
    };

    touchdrag = {
        down: "touchstart",
        up: "touchend",
        leave: "touchleave",
        move: "touchmove",
    };

    constructor(drag_elem: HTMLElement, options: Record<string, unknown>, move_elem?: HTMLElement) {
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
            enable: {
                x: true,
                y: true,
            },
            constraint: {
                top: false,
                bottom: false,
                left: false,
                right: false,
            },
            momentum_multiplier: 2000,
            duration: 1000,
            ease: Ease.easeInOutQuint,
        };

        // Animation Object
        this.animator = null;

        // Drag Event Type
        this.dragevent = this.mousedrag;

        if (touch) {
            this.dragevent = this.touchdrag;
        }

        // Draggable Data
        this.data = {
            sliding: false,
            direction: "none",
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
        // Temporarily disableing this until I have time to fix some issues.
        //DomEvent.addListener(this._el.drag, this.dragevent.down, this._onDragStart, this);
        //DomEvent.addListener(this._el.drag, this.dragevent.up, this._onDragEnd, this);

        this.data.pos.start = 0 as unknown as { x: number; y: number }; //Dom.getPosition(this._el.move);
        this._el.move.style.left = this.data.pos.start.x + "px";
        this._el.move.style.top = this.data.pos.start.y + "px";
        this._el.move.style.position = "absolute";
        //this._el.move.style.zIndex = "11";
        //this._el.move.style.cursor = "move";
    }

    disable() {
        DomEvent.removeListener(this._el.drag, this.dragevent.down, this._onDragStart, this);
        DomEvent.removeListener(this._el.drag, this.dragevent.up, this._onDragEnd, this);
    }

    stopMomentum() {
        if (this.animator) {
            this.animator.stop();
        }
    }

    updateConstraint(c: DraggableOptions["constraint"]): void {
        this.options.constraint = c;

        // Temporary until issues are fixed
    }

    /*	Private Methods
	================================================== */
    _onDragStart(e: LegacyEvent) {
        if (touch) {
            if (e.originalEvent) {
                this.data.pagex.start = e.originalEvent.touches[0].screenX;
                this.data.pagey.start = e.originalEvent.touches[0].screenY;
            } else {
                this.data.pagex.start = e.targetTouches[0].screenX;
                this.data.pagey.start = e.targetTouches[0].screenY;
            }
        } else {
            this.data.pagex.start = e.pageX;
            this.data.pagey.start = e.pageY;
        }

        // Center element to finger or mouse
        if (this.options.enable.x) {
            this._el.move.style.left = this.data.pagex.start - this._el.move.offsetWidth / 2 + "px";
        }

        if (this.options.enable.y) {
            this._el.move.style.top = this.data.pagey.start - this._el.move.offsetHeight / 2 + "px";
        }

        this.data.pos.start = Dom.getPosition(this._el.drag);
        this.data.time.start = Date.now();

        this.fire("dragstart", this.data);
        DomEvent.addListener(this._el.drag, this.dragevent.move, this._onDragMove, this);
        DomEvent.addListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
    }

    _onDragEnd(e: LegacyEvent) {
        this.data.sliding = false;
        DomEvent.removeListener(this._el.drag, this.dragevent.move, this._onDragMove, this);
        DomEvent.removeListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
        this.fire("dragend", this.data);

        //  momentum
        this._momentum();
    }

    _onDragMove(e: LegacyEvent) {
        e.preventDefault();
        this.data.sliding = true;

        if (touch) {
            if (e.originalEvent) {
                this.data.pagex.end = e.originalEvent.touches[0].screenX;
                this.data.pagey.end = e.originalEvent.touches[0].screenY;
            } else {
                this.data.pagex.end = e.targetTouches[0].screenX;
                this.data.pagey.end = e.targetTouches[0].screenY;
            }
        } else {
            this.data.pagex.end = e.pageX;
            this.data.pagey.end = e.pageY;
        }

        this.data.pos.end = Dom.getPosition(this._el.drag);
        this.data.new_pos.x = -(
            this.data.pagex.start -
            this.data.pagex.end -
            this.data.pos.start.x
        ); //-(this.data.pagex.start - this.data.pagex.end - this.data.pos.end.x);
        this.data.new_pos.y = -(
            this.data.pagey.start -
            this.data.pagey.end -
            this.data.pos.start.y
        );

        if (this.options.enable.x) {
            this._el.move.style.left = this.data.new_pos.x + "px";
        }

        if (this.options.enable.y) {
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
            };
        let swipe = false;
        const _swipe_direction = "";

        if (touch) {
            //this.options.momentum_multiplier = this.options.momentum_multiplier * 2;
        }

        pos_adjust.time = (Date.now() - this.data.time.start) * 10;
        pos_change.time = (Date.now() - this.data.time.start) * 10;

        pos_change.x =
            this.options.momentum_multiplier *
            (Math.abs(this.data.pagex.end) - Math.abs(this.data.pagex.start));
        pos_change.y =
            this.options.momentum_multiplier *
            (Math.abs(this.data.pagey.end) - Math.abs(this.data.pagey.start));

        pos_adjust.x = Math.round(pos_change.x / pos_change.time);
        pos_adjust.y = Math.round(pos_change.y / pos_change.time);

        this.data.new_pos.x = Math.min(this.data.pos.end.x + pos_adjust.x);
        this.data.new_pos.y = Math.min(this.data.pos.end.y + pos_adjust.y);

        if (!this.options.enable.x) {
            this.data.new_pos.x = this.data.pos.start.x;
        } else if (this.data.new_pos.x < 0) {
            this.data.new_pos.x = 0;
        }

        if (!this.options.enable.y) {
            this.data.new_pos.y = this.data.pos.start.y;
        } else if (this.data.new_pos.y < 0) {
            this.data.new_pos.y = 0;
        }

        // Detect Swipe
        if (pos_change.time < 3000) {
            swipe = true;
        }

        // Detect Direction
        if (Math.abs(pos_change.x) > 10000) {
            this.data.direction = "left";
            if (pos_change.x > 0) {
                this.data.direction = "right";
            }
        }
        // Detect Swipe
        if (Math.abs(pos_change.y) > 10000) {
            this.data.direction = "up";
            if (pos_change.y > 0) {
                this.data.direction = "down";
            }
        }
        this._animateMomentum();
        if (swipe) {
            this.fire("swipe_" + this.data.direction, this.data);
        }
    }

    _animateMomentum() {
        const pos = {
                x: this.data.new_pos.x,
                y: this.data.new_pos.y,
            },
            animate: AnimateOptions = {
                duration: this.options.duration,
                easing: Ease.easeOutStrong,
            };

        if (this.options.enable.y) {
            if (this.options.constraint.top || this.options.constraint.bottom) {
                if (pos.y > (this.options.constraint.bottom as number)) {
                    pos.y = this.options.constraint.bottom as number;
                } else if (pos.y < (this.options.constraint.top as number)) {
                    pos.y = this.options.constraint.top as number;
                }
            }
            animate.top = Math.floor(pos.y) + "px";
        }

        if (this.options.enable.x) {
            if (this.options.constraint.left || this.options.constraint.right) {
                if (pos.x > (this.options.constraint.left as number)) {
                    pos.x = this.options.constraint.left as number;
                } else if (pos.x < (this.options.constraint.right as number)) {
                    pos.x = this.options.constraint.right as number;
                }
            }
            animate.left = Math.floor(pos.x) + "px";
        }

        this.animator = Animate(this._el.move, animate);

        this.fire("momentum", this.data);
    }
}

export class Draggable extends Evented(DraggableBase) {
    constructor(...args: ConstructorParameters<typeof DraggableBase>) {
        super(...args);
    }
}
