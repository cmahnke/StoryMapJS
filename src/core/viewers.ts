/**
 * A minimal registry of the viewers alive on this page.
 *
 * This is deliberately *not* a viewer singleton: nothing here owns or replaces
 * a viewer, and the viewer itself holds all of its own state. It exists only
 * so a viewer can answer the one question it cannot answer alone — "given a
 * keypress or a focus change on the document, is this viewer the one that
 * should react?" Two page-wide inputs (the arrow keys and `document.activeElement`)
 * can only be attributed to a single viewer by comparing against the others.
 *
 * Entries are removed in `dispose()`, which is what keeps the registry from
 * outliving the page content it describes.
 */

/** What a viewer has to expose to take part in page-wide arbitration. */
export interface Participant {
    /** The viewer's root element, or null before layout. */
    readonly element: HTMLElement | null;
    /** Higher means more recently interacted. */
    readonly interaction: number;
}

/** Monotonic interaction clock. Shared, but it carries no state of its own. */
let interactionClock = 0;

const participants = new Set<Participant>();

/** Stamp an interaction. Returns the new value, for the caller to store. */
export function markInteraction(): number {
    interactionClock += 1;
    return interactionClock;
}

/** The interaction value currently held by the most recent participant. */
function latestInteraction(): number {
    let latest = -1;
    for (const participant of participants) {
        if (participant.interaction > latest) {
            latest = participant.interaction;
        }
    }
    return latest;
}

/** Add a viewer. Call from the same place that registers its listeners. */
export function registerParticipant(participant: Participant): void {
    participants.add(participant);
}

/** Remove a viewer. Call from `dispose()`. */
export function unregisterParticipant(participant: Participant): void {
    participants.delete(participant);
}

/** The registered viewer whose element contains `node`, if any. */
export function participantFor(node: Node | null): Participant | null {
    if (!node) {
        return null;
    }
    for (const participant of participants) {
        if (participant.element && participant.element.contains(node)) {
            return participant;
        }
    }
    return null;
}

/**
 * The viewer that should react to a page-wide event.
 *
 * Focus wins over recency: if the visitor has focused one viewer, arrow keys
 * belong to it even if they last clicked a different one. With nothing focused
 * — the common case, since clicking a `<div>` does not move focus — the most
 * recently interacted viewer takes it, so the viewer the visitor just used is
 * the one that responds.
 *
 * @param viewer - The viewer asking whether it should react.
 * @returns True if this viewer owns the event.
 */
export function ownsPageEvent(viewer: Participant): boolean {
    const active = typeof document === "undefined" ? null : document.activeElement;
    // body (or null) means the visitor has focused nothing viewer-specific
    const focused = participantFor(active);
    if (focused) {
        return focused === viewer;
    }
    // no viewer holds focus, so the most recently interacted one responds
    return viewer.interaction === latestInteraction();
}

/** The viewers currently registered. Test helper. */
export function registeredParticipants(): readonly Participant[] {
    return [...participants];
}
