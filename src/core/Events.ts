import { extend } from "../core/Util";
/*	Events
	adds custom events functionality to a class
================================================== */
interface VCOEventListener {
    action: (...args: unknown[]) => unknown;
    context: unknown;
}

interface VCOEventStore {
    [type: string]: VCOEventListener[];
}

export default class Events {
    declare "_vco_events": VCOEventStore;
    //addEventListener(/*String*/ type, /*Function*/ fn, /*(optional) Object*/ context) {
    on(/*String*/ type, /*Function*/ fn, /*(optional) Object*/ context) {
        const events = (this._vco_events = this._vco_events || {});
        events[type] = events[type] || [];
        events[type].push({
            action: fn,
            context: context || this,
        });
        return this;
    }

    hasEventListeners(/*String*/ type) /*-> Boolean*/ {
        const k = "_vco_events";
        return k in this && type in this[k] && this[k][type].length > 0;
    }

    off(/*String*/ type, /*Function*/ fn, /*(optional) Object*/ context) {
        if (!this.hasEventListeners(type)) {
            return this;
        }

        for (let i = 0, events = this._vco_events, len = events[type].length; i < len; i++) {
            if (
                events[type][i].action === fn &&
                (!context || events[type][i].context === context)
            ) {
                events[type].splice(i, 1);
                return this;
            }
        }
        return this;
    }

    fire(/*String*/ type, /*(optional) Object*/ data) {
        if (!this.hasEventListeners(type)) {
            return this;
        }

        const event = extend(
            {
                type: type,
                target: this,
            },
            data,
        );

        const listeners = this._vco_events[type].slice();

        for (let i = 0, len = listeners.length; i < len; i++) {
            listeners[i].action.call(listeners[i].context || this, event);
        }

        return this;
    }
}

//Events.on	= Events.addEventListener;
//Events.off	= Events.removeEventListener;
//Events.fire = Events.fireEvent;
