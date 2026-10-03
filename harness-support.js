/*
 * Shared test affordances for harness.html and harness-multi.html.
 *
 * Both pages are loaded by ~100 specs, so anything added here has to be opt-in
 * and must not change the default path. Two affordances:
 *
 *   ?record=imageready,loaded
 *       Collect those events into `window.__events` as `{ type, payload }`.
 *       Events are attached *after* the constructor, which is unavoidable here
 *       (the viewer is built synchronously from a fetch), so a spec must not
 *       assume it sees an event that fired during construction.
 *
 *   window.__tileSourceFactory
 *       A `tile_source_factory` is a function, so it cannot ride in the
 *       `?options={json}` param. A spec defines it in an `addInitScript`,
 *       which runs before the harness module, and the harness picks it up.
 */

/**
 * Subscribe to `names` on `emitter` and push `{ type, payload }` records onto
 * `window.__events`.
 *
 * @param emitter - Anything with an `on(type, listener)` method.
 * @param spec - Comma-separated event names, or null/empty for none.
 * @param scope - The window the records are written to.
 * @param suffix - Optional tag so two viewers' events stay apart.
 */
export function recordEvents(emitter, spec, scope, suffix = "") {
    const names = (spec ?? "")
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
    if (names.length === 0) {
        return;
    }
    scope.__events = scope.__events ?? [];
    for (const name of names) {
        emitter.on(name, (payload) => {
            scope.__events.push({ type: name, viewer: suffix, payload: summarize(payload) });
        });
    }
}

/**
 * The tile source factory a spec installed, if any.
 *
 * @param scope - Usually `window`.
 * @returns The factory, or undefined.
 */
export function tileFactoryFrom(scope) {
    return typeof scope.__tileSourceFactory === "function" ? scope.__tileSourceFactory : undefined;
}

/**
 * Reduce an event payload to something a test can assert on and that survives
 * `JSON.stringify` in the page.
 *
 * OpenLayers injects `type` and `target` (the map) into every fired event, and
 * both the map and its layers are object graphs with cycles — passing one
 * through verbatim makes the whole `window.__events` unserialisable, so a
 * single unhandled payload breaks every later read.
 */
function summarize(payload) {
    if (payload === null || typeof payload !== "object") {
        return payload;
    }
    const out = {};
    for (const [key, value] of Object.entries(payload)) {
        if (value === null || typeof value !== "object") {
            out[key] = typeof value === "function" ? "[fn]" : value;
        } else if (key === "source" || key === "layer") {
            // an ol source/layer: record what identifies it, not the graph
            out[key] = {
                type: value.constructor?.name ?? null,
                state: typeof value.getState === "function" ? value.getState() : undefined,
                url: value.url_ ?? value.href_ ?? safeGet(value, "url"),
            };
        } else if (key === "target") {
            out[key] = summarizeMap(value);
        } else if (Array.isArray(value)) {
            out[key] = value.map((entry) => summarize(entry));
        } else {
            // a plain data object is fine to keep; anything else is an object
            // graph we must not walk
            const proto = Object.getPrototypeOf(value);
            const plain = proto === Object.prototype || proto === null;
            out[key] = plain ? summarize(value) : { type: value.constructor?.name ?? null };
        }
    }
    return out;
}

/** `layer.get("url")` without letting a getter throw take the page down. */
function safeGet(target, key) {
    try {
        return target.get?.(key);
    } catch {
        return undefined;
    }
}

/**
 * Snapshot the map an event carries in its `target`, at the moment the event
 * fired.
 *
 * This is the contract `imageready` exists to provide: a host that overlays or
 * measures its own layers needs a *sized viewport and a resolved view* the
 * instant the event arrives, because `loaded` can fire earlier. Recording it
 * here — synchronously inside the listener, before the spec reads
 * `window.__events` — is the only way a spec can check that without racing
 * the event; reading `window.__sm.map` afterwards would pass while no longer
 * testing measurability at fire time.
 *
 * The `target` is the `StoryMap` viewer itself (`fire()` stamps
 * `target: this`, so the re-fired `imageready` carries the viewer, not the
 * engine that first raised it). Reach through to the public `.map` for the
 * raw `ol/Map`, falling back to the engine's `_map` for events subscribed on
 * the engine directly.
 */
function summarizeMap(target) {
    const map = isOlMap(target)
        ? target
        : isOlMap(target?.map)
          ? target.map
          : isOlMap(target?._map)
            ? target._map
            : null;
    if (!map) {
        return { type: target?.constructor?.name ?? null };
    }
    const view = map.getView();
    const size = map.getSize();
    return {
        type: target?.constructor?.name ?? null,
        size: size ? [size[0], size[1]] : null,
        center: view?.getCenter?.() ?? null,
        resolution: view?.getResolution?.() ?? null,
        projection: view?.getProjection?.()?.getCode?.() ?? null,
    };
}

/** Duck-type an ol/Map: it is the thing that can size and resolve a view. */
function isOlMap(candidate) {
    return (
        !!candidate &&
        typeof candidate.getSize === "function" &&
        typeof candidate.getView === "function"
    );
}
