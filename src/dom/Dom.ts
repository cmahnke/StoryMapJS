/*	Dom
	Utilities for working with the DOM
================================================= */

export default class Dom {
    static get(id: string | HTMLElement): HTMLElement | null {
        return typeof id === "string" ? document.getElementById(id) : id;
    }

    static create(tagName: string, className: string, container?: HTMLElement): HTMLElement {
        const el = document.createElement(tagName);
        el.className = className;
        if (container) {
            container.appendChild(el);
        }
        return el;
    }

    static getPosition(el: HTMLElement | null): { x: number; y: number } {
        const pos = {
            x: 0,
            y: 0,
        };
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            pos.x += el.offsetLeft;
            pos.y += el.offsetTop;
            el = el.offsetParent as HTMLElement | null;
        }
        return pos;
    }
}
