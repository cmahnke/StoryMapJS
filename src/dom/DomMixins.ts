/*	DomMixins
	DOM methods used regularly
	Assumes there is a _el.container and animator
================================================== */
import Animate from "../animation/Animate";
import Dom from "./Dom";

export default class DomMixins {
    declare "_el": any;
    declare "options": any;
    declare "animator": any;
    declare "fire": any;
    declare "data": any;

    /*	Adding, Hiding, Showing etc
	================================================== */
    show(animate) {
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

    hide(animate) {
        this._el.container.style.display = "none";
    }

    addTo(container) {
        container.appendChild(this._el.container);
        this.onAdd();
    }

    removeFrom(container) {
        container.removeChild(this._el.container);
        this.onRemove();
    }

    /*	Animate to Position
	================================================== */
    animatePosition(pos, el, use_percent) {
        const ani = {
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
    setPosition(pos, el) {
        for (const name in pos) {
            if (Object.hasOwn(pos, name)) {
                if (el) {
                    el.style[name] = pos[name] + "px";
                } else {
                    this._el.container.style[name] = pos[name] + "px";
                }
            }
        }
    }

    getPosition() {
        return Dom.getPosition(this._el.container);
    }
}
