import { stamp } from "../core/Util";

/*	DomEvent
	Inspired by Leaflet
	DomEvent contains functions for working with DOM events.
================================================== */

var DomEvent: any = {
	addListener: function (obj, type, fn, context) {
		const handler = function (e) {
			return fn.call(context || obj, e);
		};

		obj.addEventListener(type, handler, false);
		obj['_vco_' + type + stamp(fn)] = handler;
	},

	removeListener: function (obj, type, fn, context) {
		const key = '_vco_' + type + stamp(fn);
		const handler = obj[key];

		if (!handler) {
			return;
		}

		obj.removeEventListener(type, handler, false);
		obj[key] = null;
	},

	_checkMouse: function (el, e) {
		let related = e.relatedTarget;

		if (!related) {
			return true;
		}

		try {
			while (related && (related !== el)) {
				related = related.parentNode;
			}
		} catch {
			return false;
		}

		return (related !== el);
	},

	stopPropagation: function (e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	},

	disableClickPropagation: function (el) {
		DomEvent.addListener(el, 'mousedown', DomEvent.stopPropagation);
		DomEvent.addListener(el, 'click', DomEvent.stopPropagation);
		DomEvent.addListener(el, 'dblclick', DomEvent.stopPropagation);
	},

	preventDefault: function (e) {
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
	},

	stop: function (e) {
		DomEvent.preventDefault(e);
		DomEvent.stopPropagation(e);
	},

	getWheelDelta: function (e) {
		return -e.deltaY / 40;
	}
};

export { DomEvent }
