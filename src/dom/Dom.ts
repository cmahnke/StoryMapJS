/*	Dom
	Utilities for working with the DOM
================================================== */
import { Browser } from "../core/Browser";

export default class Dom {
    static TRANSITION: string | false = Dom.testProp([
        "transition",
        "webkitTransition",
        "OTransition",
        "MozTransition",
        "msTransition",
    ]);
    static TRANSFORM: string | false = Dom.testProp([
        "transformProperty",
        "WebkitTransform",
        "OTransform",
        "MozTransform",
        "msTransform",
    ]);
    static TRANSLATE_OPEN: string = "translate" + (Browser.webkit3d ? "3d(" : "(");
    static TRANSLATE_CLOSE: string = Browser.webkit3d ? ",0)" : ")";

    static get(id: string | HTMLElement): HTMLElement | null {
        return typeof id === "string" ? document.getElementById(id) : id;
    }

    static getByClass(id: string): HTMLCollectionOf<Element> | undefined {
        if (id) {
            return document.getElementsByClassName(id);
        }
    }

    static create(tagName: string, className: string, container?: HTMLElement): HTMLElement {
        const el = document.createElement(tagName);
        el.className = className;
        if (container) {
            container.appendChild(el);
        }
        return el;
    }

    static createText(content: string, container?: HTMLElement): Text {
        const el = document.createTextNode(content);
        if (container) {
            container.appendChild(el);
        }
        return el;
    }

    static getTranslateString(point: { x: number; y: number }): string {
        return Dom.TRANSLATE_OPEN + point.x + "px," + point.y + "px" + Dom.TRANSLATE_CLOSE;
    }

    static setPosition(el: HTMLElement, point: { x: number; y: number }): void {
        (el as HTMLElement & { _vco_pos?: { x: number; y: number } })._vco_pos = point;
        if (Browser.webkit3d) {
            (el.style as unknown as Record<string, string>)[Dom.TRANSFORM as string] =
                Dom.getTranslateString(point);

            if (Browser.android) {
                (el.style as unknown as Record<string, string>)["-webkit-perspective"] = "1000";
                (el.style as unknown as Record<string, string>)["-webkit-backface-visibility"] =
                    "hidden";
            }
        } else {
            el.style.left = point.x + "px";
            el.style.top = point.y + "px";
        }
    }

    static getPosition(el: HTMLElement | null): { x: number; y: number } {
        const pos = {
            x: 0,
            y: 0,
        };
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            pos.x += el.offsetLeft; // - el.scrollLeft;
            pos.y += el.offsetTop; // - el.scrollTop;
            el = el.offsetParent as HTMLElement | null;
        }
        return pos;
    }

    static testProp(props: string[]): string | false {
        const style = document.documentElement.style;

        for (let i = 0; i < props.length; i++) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    }
}
