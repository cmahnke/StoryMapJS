import { asRecord, isHttpUrl } from "./iiif-shared";

/**
 * IIIF Content State 1.0 — the `iiif-content` initialization parameter.
 *
 * A content state says which part of a IIIF resource a viewer should show. The
 * spec defines four forms and a viewer "should be able to accept and process the
 * content state in all of these forms":
 *
 * | Form                     | Shape                          | As a GET parameter     |
 * | ------------------------ | ------------------------------ | ---------------------- |
 * | 2.2.1 full Annotation     | JSON-LD, `motivation: contentState` | content-state-encoded |
 * | 2.2.2 Annotation URI      | a string URI                   | plain                  |
 * | 2.2.3 Target Body         | JSON-LD, the `target` value    | content-state-encoded |
 * | 2.2.4 Target URI          | a string URI                   | plain                  |
 *
 * So a **plain URI is never encoded**, and a **JSON-LD form always is** — that
 * asymmetry is the spec's, and getting it backwards is the easiest way to be
 * wrong here. A region also *has* to use a JSON-LD form: §2.2.5 says the bare
 * target-URI form "is not capable of expressing content states that are part of
 * a IIIF resource, such as a region of a Canvas".
 *
 * This module reads all four forms and writes the simplest one that can carry
 * the state, which is the Target URI for a whole canvas and the Target Body for
 * a region.
 */

/** The initialization parameter the spec names. */
export const CONTENT_STATE_PARAM = "iiif-content";

export type ContentState = {
    /** The canvas (or other resource) the state points at. */
    id: string;
    /**
     * `[x, y, w, h]` in canvas pixels, when the state names a part of the
     * canvas. Carried on the id as an `xywh=` fragment, which is the
     * Media Fragments spelling the spec uses in every region example.
     */
    region?: [number, number, number, number];
};

type Json = Record<string, unknown>;

/**
 * Content-state-encoding (spec §6.1): `encodeURIComponent`, then base64url,
 * then strip the `=` padding — which exists so a later percent-encoding pass
 * cannot mangle the value.
 */
export function encodeContentState(plain: string): string {
    const base64 = btoa(encodeURIComponent(plain));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/** The inverse of {@link encodeContentState}. */
export function decodeContentState(encoded: string): string {
    // padding must be restored before base64 can be decoded, and a length of
    // 4n+1 is unrecoverable
    const pad = encoded.length % 4;
    if (pad === 1) {
        throw new Error("InvalidLengthError: not a valid content state encoding");
    }
    const base64url = pad === 0 ? encoded : encoded + "====".slice(0, 4 - pad);
    return decodeURIComponent(atob(base64url.replace(/-/g, "+").replace(/_/g, "/")));
}

/** `[x, y, w, h]` from an `xywh=` / `xywh=pixel:` fragment, or null. */
function regionFromFragment(id: string): [string, [number, number, number, number]] | null {
    const at = id.indexOf("#");
    if (at === -1) return null;
    const match = /xywh=(?:pixel:)?(-?\d+),(-?\d+),(\d+),(\d+)/.exec(id.slice(at));
    if (!match) return null;
    const parts = match.slice(1, 5).map(Number);
    if (!parts.every((n) => Number.isFinite(n))) return null;
    return [id.slice(0, at), parts as [number, number, number, number]];
}

function stateFromId(id: unknown): ContentState | null {
    if (typeof id !== "string" || id === "") return null;
    const withRegion = regionFromFragment(id);
    if (withRegion === null) return { id };
    const [base, region] = withRegion;
    return { id: base, region };
}

/**
 * The target of a content state Annotation, which may be a bare resource, a
 * `SpecificResource` with a `source`, or a list of targets (§5.3 shares several
 * canvases; the first is the one a linear storymap can act on).
 */
function stateFromTarget(target: unknown): ContentState | null {
    const first = Array.isArray(target) ? target[0] : target;
    const record = asRecord(first);
    if (record === null) return null;
    // a SpecificResource: the canvas is in `source`, the part in `selector`
    if (record.source !== undefined) {
        const source = stateFromId(asRecord(record.source)?.id);
        if (source === null) return null;
        const selector = asRecord(record.selector);
        const value = typeof selector?.value === "string" ? selector.value : null;
        const match =
            value === null ? null : /xywh=(?:pixel:)?(-?\d+),(-?\d+),(\d+),(\d+)/.exec(value);
        if (match) {
            const parts = match.slice(1, 5).map(Number);
            if (parts.every((n) => Number.isFinite(n))) {
                return { id: source.id, region: parts as [number, number, number, number] };
            }
        }
        return source;
    }
    return stateFromId(record.id);
}

/**
 * Parse an `iiif-content` parameter value in any of the spec's forms, and
 * return null when it names nothing we can act on.
 *
 * The parameter is `URLSearchParams`-decoded before it arrives here, so the
 * plain forms arrive as ordinary strings. A JSON-LD form arrives
 * content-state-encoded, which is distinguishable from a plain URI: a URI's
 * scheme is not valid base64url in a way we can rely on, so the test is simply
 * whether decoding it yields JSON.
 */
export function parseContentState(value: string | null | undefined): ContentState | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (trimmed === "") return null;

    if (trimmed.startsWith("{")) {
        // Inline JSON-LD is accepted unencoded by the spec's other mechanisms
        // (data-iiif-content, paste, drag and drop), so accept it here too
        return stateFromJson(trimmed);
    }

    if (isHttpUrl(trimmed)) {
        // 2.2.2 or 2.2.4: a plain URI, never encoded. It is either the target
        // itself or a content state Annotation we would have to dereference,
        // and dereferencing is the host's call, not ours.
        return stateFromId(trimmed);
    }

    // Anything else should be a content-state-encoded JSON-LD form
    try {
        return stateFromJson(decodeContentState(trimmed));
    } catch {
        return null;
    }
}

function stateFromJson(json: string): ContentState | null {
    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch {
        return null;
    }
    const record = asRecord(parsed);
    if (record === null) return null;
    // the full Annotation form (2.2.1) carries the target one level down
    if (record.target !== undefined) return stateFromTarget(record.target);
    // the Target Body form (2.2.3) *is* the target
    return stateFromTarget(record);
}

/**
 * The value to put in an `iiif-content` parameter for a state.
 *
 * A whole canvas is a plain Target URI, which the spec says must not be
 * encoded. A region needs the Target Body form, content-state-encoded, because
 * a bare URI cannot express part of a resource (§2.2.5).
 */
export function formatContentState(state: ContentState, manifestId?: string | null): string {
    if (state.region === undefined) return state.id;
    const target: Json = { id: `${state.id}#xywh=${state.region.join(",")}`, type: "Canvas" };
    if (typeof manifestId === "string" && manifestId !== "") {
        // the Manifest the canvas belongs to, so a client can load the resource
        // the canvas is to be found in
        target.partOf = [{ id: manifestId, type: "Manifest" }];
    }
    return encodeContentState(JSON.stringify(target));
}
