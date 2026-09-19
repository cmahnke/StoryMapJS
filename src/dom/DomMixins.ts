/*	DomMixins
	DOM methods used regularly
	Assumes there is a _el.container and animator
================================================== */
import Animate from "morpheus";
import Dom from "./Dom";
import type { AnimationHandle } from "../types";

interface DomMixinsOptions {
    duration: number;
    ease: unknown;
}

interface Evented {
    fire: (type: string, data?: unknown, target?: unknown) => unknown;
    on: (type: string, fn: unknown, context?: unknown) => unknown;
    hasEventListeners: (type: string) => boolean;
}

export default class DomMixins {
    declare "_el": Record<string, HTMLElement>;
    declare "options": DomMixinsOptions;
    declare "animator": AnimationHandle;
    declare "fire": Evented["fire"];
    declare "data": Record<string, unknown>;

    /*	Adding, Hiding, Showing etc
	================================================== */
    show(animate: boolean): void {
        if (animate) {
            /*
			this.animator = Animate(this._el.container, {
				left: 		-(this._el.container.offsetWidth * n) + "px",
				duration: 	this.options.duration,
				easing: 	this.options.ease
			});
			*/
        } else {
            this._el.container.style.display = "block";
        }
    }

    hide(animate: boolean): void {
        this._el.container.style.display = "none";
    }

    addTo(container: HTMLElement): void {
        container.appendChild(this._el.container);
        this.onAdd();
    }

    removeFrom(container: HTMLElement): void {
        container.removeChild(this._el.container);
        this.onRemove();
    }

    /*	Animate to Position
	================================================== */
    animatePosition(pos: Record<string, number>, el: HTMLElement, use_percent: boolean): void {
        const ani: Record<string, unknown> = {
            duration: this.options.duration,
            easing: this.options.ease,
        };
        for (const name in pos) {
            if (Object.hasOwn(pos, name)) {
                if (use_percent) {
                    ani[name] = pos[name] + "%";
                } else {
                    ani[name] = pos[name] + "px";
                }
            }
        }

        if (this.animator) {
            this.animator.stop();
        }
        this.animator = Animate(el, ani);
    }

    /*	Events
	================================================== */

    onLoaded() {
        this.fire("loaded", this.data);
    }

    onAdd() {
        this.fire("added", this.data);
    }

    onRemove() {
        this.fire("removed", this.data);
    }

    /*	Set the Position
	================================================== */
    setPosition(pos: Record<string, number>, el?: HTMLElement): void {
        for (const name in pos) {
            if (Object.hasOwn(pos, name)) {
                if (el) {
                    (el.style as unknown as Record<string, string>)[name] = pos[name] + "px";
                } else {
                    (this._el.container.style as unknown as Record<string, string>)[name] =
                        pos[name] + "px";
                }
            }
        }
    }

    getPosition() {
        return Dom.getPosition(this._el.container);
    }
}
