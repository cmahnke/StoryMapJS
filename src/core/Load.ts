/*	Load
    Loads external Javascript and CSS using plain DOM element injection.
    Modern browsers preserve execution order for dynamically inserted
    scripts with async=false, so no queueing machinery is needed.
================================================== */

export interface LoadOptions {
    /** Abort the load (removes the element, rejects the promise). */
    signal?: AbortSignal;
}

function loadElement(
    tag: "script" | "link",
    attrs: Record<string, string>,
    options?: LoadOptions,
): Promise<void> {
    return new Promise((resolve, reject) => {
        if (options?.signal?.aborted) {
            reject(new DOMException("Load aborted", "AbortError"));
            return;
        }
        const node = document.createElement(tag);
        for (const attr in attrs) {
            if (Object.hasOwn(attrs, attr)) {
                node.setAttribute(attr, attrs[attr]);
            }
        }
        if (tag === "script") {
            (node as HTMLScriptElement).async = false;
        }
        const cleanup = () => {
            node.onload = null;
            node.onerror = null;
            options?.signal?.removeEventListener("abort", onAbort);
        };
        const onAbort = () => {
            cleanup();
            node.remove();
            reject(new DOMException("Load aborted", "AbortError"));
        };
        node.onload = () => {
            cleanup();
            resolve();
        };
        node.onerror = () => {
            cleanup();
            reject(new Error(`Failed to load ${attrs.src ?? attrs.href}`));
        };
        options?.signal?.addEventListener("abort", onAbort, { once: true });
        document.head.appendChild(node);
    });
}

/**
 * In-flight and completed loads, keyed by URL.
 *
 * A page can hold more than one viewer, and they all need the same third-party
 * scripts (the YouTube and SoundCloud APIs) and the same font stylesheet.
 * Injecting those once per viewer re-defines `window.YT`/`window.SC` and
 * re-applies the theme, so the second viewer awaits the first load instead.
 *
 * This is per bundle copy: two separately bundled copies of StoryMapJS on one
 * page each keep their own map and would still both inject.
 */
const sharedLoads = new Map<string, Promise<void>>();

/** Reject `promise` early if `signal` aborts, without touching the load. */
function withAbort(promise: Promise<void>, signal: AbortSignal): Promise<void> {
    if (signal.aborted) {
        return Promise.reject(new DOMException("Load aborted", "AbortError"));
    }
    return new Promise<void>((resolve, reject) => {
        const onAbort = () => {
            reject(new DOMException("Load aborted", "AbortError"));
        };
        signal.addEventListener("abort", onAbort, { once: true });
        promise.then(resolve, reject).then(() => {
            signal.removeEventListener("abort", onAbort);
        });
    });
}

function loadOnce(url: string, load: () => Promise<void>, options?: LoadOptions): Promise<void> {
    let shared = sharedLoads.get(url);
    if (!shared) {
        shared = load().catch((err: unknown) => {
            // never cache a failure: the next viewer should get a fresh try
            sharedLoads.delete(url);
            throw err;
        });
        sharedLoads.set(url, shared);
    }
    if (!options?.signal) {
        return shared;
    }
    // A viewer aborts its own media loads when it is torn down. That must
    // reject this caller's promise without cancelling the load a sibling
    // viewer is still waiting on, so the shared load gets no signal at all.
    return withAbort(shared, options.signal);
}

/**
 * Append a script to the document head.
 *
 * Concurrent and repeat requests for the same URL share one injected script.
 *
 * @param url - The script URL.
 * @param options - Optional AbortSignal to cancel an in-flight load.
 * @returns Resolves when the script has loaded, rejects on error or abort.
 */
function loadJS(url: string, options?: LoadOptions): Promise<void> {
    return loadOnce(url, () => loadElement("script", { src: url }), options);
}

/**
 * Append one stylesheet to the document head.
 *
 * Concurrent and repeat requests for the same URL share one `<link>`.
 *
 * @param url - The stylesheet URL.
 * @param options - Optional AbortSignal to cancel an in-flight load.
 * @returns Resolves when the stylesheet has loaded, rejects on error or abort.
 */
function loadCSS(url: string, options?: LoadOptions): Promise<void> {
    return loadOnce(url, () => loadElement("link", { href: url, rel: "stylesheet" }), options);
}

export interface JSONPOptions extends LoadOptions {
    /** Milliseconds to wait for the callback before rejecting (default 15000). */
    timeout?: number;
}

let globalNameCounter = 0;

/**
 * Claim a free global callback slot: names derived from content (e.g. a
 * Wikipedia article title) are not unique per request, and concurrent loads
 * sharing a name would clobber each other's handler — delivering payloads to
 * the wrong promise and leaving the loser's script calling a deleted global
 * (Uncaught ReferenceError).
 *
 * @param base - The preferred global function name.
 * @returns `base` when free, otherwise `base` with a numeric suffix.
 */
function uniqueGlobalName(base: string): string {
    const globals = window as unknown as Record<string, unknown>;
    if (!Object.hasOwn(globals, base)) {
        return base;
    }
    let candidate: string;
    do {
        globalNameCounter += 1;
        candidate = `${base}_${globalNameCounter}`;
    } while (Object.hasOwn(globals, candidate));
    return candidate;
}

/**
 * Load a JSONP endpoint: injects a script that calls a global function with
 * its payload, and resolves with that payload. The global is removed and the
 * script element detached once settled.
 *
 * @param url - The full JSONP URL (must include the callback parameter).
 * @param callbackName - The global function name the endpoint will invoke.
 *   Must be claimed via uniqueGlobalName when concurrent loads may share it.
 * @param options - Optional AbortSignal and timeout.
 * @returns Resolves with the JSONP payload, rejects on error, abort or timeout.
 */
function loadJSONP<T>(url: string, callbackName: string, options?: JSONPOptions): Promise<T> {
    return new Promise((resolve, reject) => {
        if (options?.signal?.aborted) {
            reject(new DOMException("Load aborted", "AbortError"));
            return;
        }
        const globals = window as unknown as Record<string, unknown>;
        const script = document.createElement("script");
        let settled = false;
        const cleanup = () => {
            settled = true;
            clearTimeout(timer);
            script.remove();
            if (globals[callbackName] === onCallback) {
                delete globals[callbackName];
            }
            options?.signal?.removeEventListener("abort", onAbort);
        };
        // Abandon without deleting: an already-fetched script may still
        // execute afterwards, and calling a deleted global throws an
        // Uncaught ReferenceError. The self-deleting stub swallows it.
        const abandon = () => {
            settled = true;
            clearTimeout(timer);
            script.remove();
            if (globals[callbackName] === onCallback) {
                globals[callbackName] = () => {
                    delete globals[callbackName];
                };
            }
            options?.signal?.removeEventListener("abort", onAbort);
        };
        const onAbort = () => {
            if (!settled) {
                abandon();
                reject(new DOMException("Load aborted", "AbortError"));
            }
        };
        const onCallback = (data: T) => {
            if (!settled) {
                cleanup();
                resolve(data);
            }
        };
        const timer = setTimeout(() => {
            if (!settled) {
                abandon();
                reject(new Error(`JSONP request timed out: ${url}`));
            }
        }, options?.timeout ?? 15000);
        globals[callbackName] = onCallback;
        script.onerror = () => {
            if (!settled) {
                abandon();
                reject(new Error(`Failed to load ${url}`));
            }
        };
        options?.signal?.addEventListener("abort", onAbort, { once: true });
        script.src = url;
        document.body.appendChild(script);
    });
}

export { loadJS, loadCSS, loadJSONP, uniqueGlobalName };
