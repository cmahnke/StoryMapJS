// Mixin helpers following the TypeScript handbook mixin pattern:
// https://www.typescriptlang.org/docs/handbook/mixins.html

/* eslint-disable @typescript-eslint/no-explicit-any -- the handbook mixin
   pattern requires mixin constructors to take a single any[] rest parameter
   (see TS2545). */

/** Constructor shape accepted by the mixin functions. */
export type Constructor<T = object> = new (...args: any[]) => T;

/** What a listener receives: the payload, plus the framework's own fields.
 *
 * Kept as an intersection because `fire` merges them into one object — that
 * is what a handler gets. As a side effect it also fixes the `type`
 * clobbering at the type level: intersecting `type: "loaded"` with
 * `type?: string` yields `"loaded"`.
 */
export type FiredEvent<M, K extends keyof M & string> = M[K] & { type: K; target: unknown };

/** Eventing members provided by the Evented mixin. */
export interface EventedInstance<M = Record<string, unknown>> {
    on<K extends keyof M & string>(
        type: K,
        fn: (e: FiredEvent<M, K>) => void,
        context?: unknown,
    ): this;
    off<K extends keyof M & string>(
        type: K,
        fn: (e: FiredEvent<M, K>) => void,
        context?: unknown,
    ): this;
    fire<K extends keyof M & string>(type: K, data?: M[K]): this;
    hasEventListeners<K extends keyof M & string>(type: K): boolean;
}

/**
 * Instance contract for DomMixed consumers.
 *
 * `_el` is deliberately `Record<string, unknown>`: each class declares its
 * own element shape, and several of them hold members that are legitimately
 * null before the component builds them (a slide's call-to-action, a
 * slider's live region). Requiring `Record<string, HTMLElement>` here would
 * force every one of those back into an `{} as HTMLElement` placeholder.
 */
export interface DomMixedInstance<M = Record<string, unknown>> extends EventedInstance<M> {
    _el: Record<string, unknown>;
    data?: unknown;
}

/*	Evented
	adds custom events functionality to a class (semantics of the former
	core/Events class)
================================================== */

/** Adds eventing (on/off/fire/hasEventListeners) to a class. */
export function Evented<M, T extends Constructor>(Base: T) {
    return class extends Base {
        declare "_vco_events"?: Record<string, { action: unknown; context: unknown }[]>;

        on(
            /*String*/ type: string,
            /*Function*/ fn: unknown,
            /*(optional) Object*/ context?: unknown,
        ): this {
            const events = (this._vco_events = this._vco_events || {});
            events[type] = events[type] || [];
            events[type].push({
                action: fn,
                context: context || this,
            });
            return this;
        }

        hasEventListeners(/*String*/ type: string) /*-> Boolean*/ {
            return !!this._vco_events?.[type]?.length;
        }

        off(
            /*String*/ type: string,
            /*Function*/ fn: unknown,
            /*(optional) Object*/ context?: unknown,
        ): this {
            if (!this.hasEventListeners(type)) {
                return this;
            }
            const events = this._vco_events as Record<
                string,
                { action: unknown; context: unknown }[]
            >;
            events[type] = events[type].filter(
                (listener) =>
                    !(
                        listener.action === fn &&
                        (!context || listener.context === context)
                    ),
            );
            if (events[type].length === 0) {
                delete events[type];
            }
            return this;
        }

        fire(
            /*String*/ type: string,
            /*(optional) Object*/ data?: unknown,
        ): this {
            if (!this.hasEventListeners(type)) {
                return this;
            }

            const event = {
                ...(data as Record<string, unknown> | undefined),
                type,
                target: this,
            };

            const listeners = (
                this._vco_events as Record<string, { action: unknown; context: unknown }[]>
            )[type].slice();

            for (const listener of listeners) {
                (listener.action as (e: unknown) => void).call(listener.context || this, event);
            }

            return this;
        }

        constructor(...args: any[]) {
            super(...args);
        }
    } as Constructor<EventedInstance<M>> & T;
}

/*	DomMixed
	DOM container conveniences, replacing the former DomMixins runtime
	mixin (addTo/removeFrom call the onAdd/onRemove lifecycle hooks)
================================================== */

/** Adds DOM container conveniences (addTo/removeFrom/setPosition/show/hide
 *  and the onAdd/onRemove/onLoaded lifecycle events) to a class. */
export function DomMixed<
    M extends { loaded: unknown; added: unknown; removed: unknown },
    T extends Constructor<DomMixedInstance<M>>,
>(Base: T) {
    return class extends Base {
        /**
         * The host element. Every DomMixed consumer keeps its root element
         * here, so this narrows the `Record<string, unknown>` element map to
         * something with a style and children.
         */
        container(): HTMLElement {
            return this._el.container as HTMLElement;
        }

        /*	Adding, Hiding, Showing etc
        ================================================== */
        show(animate?: unknown): void {
            if (!animate) {
                this.container().style.display = "block";
            }
            // animated show is not implemented
        }

        hide(): void {
            this.container().style.display = "none";
        }

        addTo(container: HTMLElement): this {
            container.appendChild(this.container());
            this.onAdd();
            return this;
        }

        removeFrom(container: HTMLElement): this {
            container.removeChild(this.container());
            this.onRemove();
            return this;
        }

        /*	Set the Position
        ================================================== */
        setPosition(pos: Record<string, number>, el?: HTMLElement): this {
            const target = el || this.container();
            for (const name of Object.keys(pos)) {
                (target.style as unknown as Record<string, string>)[name] = pos[name] + "px";
            }
            return this;
        }

        /*	Lifecycle events
	================================================== */
        onLoaded(): void {
            this.fire("loaded", this.data as M["loaded"]);
        }

        onAdd(): void {
            this.fire("added", this.data as M["added"]);
        }

        onRemove(): void {
            this.fire("removed", this.data as M["removed"]);
        }

        constructor(...args: any[]) {
            super(...args);
        }
    };
}
