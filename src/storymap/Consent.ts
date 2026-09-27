import { Language } from "../language/Language";
import Dom from "../dom/Dom";

/** localStorage key holding the per-service consent state (JSON). */
const CONSENT_STORAGE_KEY = "storymapjs-consent";

/**
 * Read the shared consent record, remapping keys written by an earlier
 * version onto their namespaced form.
 *
 * @returns The state, and whether any key was remapped (so a caller can
 *          write the modern form back once and retire the legacy keys).
 */
function readStoredState(): { state: Record<string, boolean>; migrated: boolean } {
    const state: Record<string, boolean> = {};
    let migrated = false;
    try {
        const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!raw) {
            return { state, migrated };
        }
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        for (const stored in parsed) {
            if (!Object.hasOwn(parsed, stored)) continue;
            const key = migrateLegacyKey(stored);
            if (key !== stored) {
                migrated = true;
            }
            state[key] = parsed[stored];
        }
    } catch {
        // ignore malformed or unavailable storage
    }
    return { state, migrated };
}

/** Write the shared consent record. */
function writeStoredState(state: Record<string, boolean>): void {
    try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
        // storage unavailable (e.g. sandboxed contexts)
    }
}

/**
 * An external service the viewer asks permission to load.
 *
 * `key` is the *only* thing ever persisted, and it is stable, namespaced and
 * never localized. `label` is display-only.
 *
 * These are two separate fields on purpose. The code used to pass a single
 * string that served as both, which had two consequences:
 *
 *  - the tile and font services used a *localized* string as the localStorage
 *    key, so translating `consent_service_tiles` would have silently
 *    invalidated every stored decision the moment the page language changed;
 *  - the per-slide panel used the media type *slug* as its display label, so
 *    it asked "Load content from youtube?" where the start-of-story dialog,
 *    20 lines away, correctly said "YouTube".
 *
 * With the pair split, passing a label where a key is expected is no longer
 * expressible.
 */
export interface ConsentService {
    /** Stable, namespaced, non-localized. The only value that is stored. */
    key: string;
    /** Display name. Localized for tiles/fonts; a brand name for media. */
    label: string;
}

/** Namespaced storage keys. Prefixed so a future service can never collide
 *  with a bare media type slug. */
const TILE_KEY = "map:tiles";
const FONT_KEY = "fonts:web";
const MEDIA_KEY_PREFIX = "media:";

/** The map tile service: the basemap, overlays, minimap and overview. */
export function tileService(): ConsentService {
    return {
        key: TILE_KEY,
        label: consentMessage("consent_service_tiles", "map tiles"),
    };
}

/** An externally hosted web-font theme. */
export function fontService(): ConsentService {
    return {
        key: FONT_KEY,
        label: consentMessage("consent_service_fonts", "web fonts"),
    };
}

/**
 * A media embed from an external service.
 *
 * `type` is the MediaType slug (the stable identity); `name` is its display
 * name (a brand name, e.g. "YouTube"). Both are needed: the slug is what gets
 * stored and what the error-icon class is derived from, the name is what the
 * visitor reads.
 */
export function mediaService(type: string, name: string): ConsentService {
    return { key: MEDIA_KEY_PREFIX + type, label: name || type };
}

/**
 * Map a key written by an earlier version onto the current namespaced form.
 *
 * The pre-registry code stored bare slugs for media (`"youtube"`) and the
 * *localized* strings for tiles and fonts (`"map tiles"`, `"web fonts"` — which
 * is why every locale happened to fall back to the English spelling, and why
 * translating them would have orphaned everyone's decisions).
 *
 * Every current key contains a `:` and no legacy key does, so that is the
 * discriminator. Enumerating the current keys instead looked more explicit
 * but silently re-prefixed `map:tiles` into `media:map:tiles` on every read,
 * so a stored grant was never found again.
 */
function migrateLegacyKey(key: string): string {
    if (key.includes(":")) {
        return key;
    }
    if (key === "map tiles") return TILE_KEY;
    if (key === "web fonts") return FONT_KEY;
    return MEDIA_KEY_PREFIX + key;
}

/** A button in a consent dialog. */
function consentButton(kind: "allow" | "deny", text: string): HTMLButtonElement {
    const button = Dom.create("button", `vco-consent-${kind}`) as HTMLButtonElement;
    button.setAttribute("type", "button");
    button.textContent = text;
    return button;
}

/** The title/message pair shared by both dialog shapes. */
function consentHeader(
    titleText: string,
    messageText: string,
): { title: HTMLElement; message: HTMLElement } {
    const title = Dom.create("p", "vco-consent-title");
    title.textContent = titleText;
    const message = Dom.create("p", "vco-consent-message");
    message.textContent = messageText;
    return { title: title, message: message };
}

/**
 * Per-StoryMap GDPR consent manager. When the `consent_required` option is
 * set, every external service (media embeds, map tiles, external font CSS)
 * asks for permission before anything is loaded.
 *
 * Decisions are remembered per service in localStorage with no expiry:
 * clearing site data is what makes the viewer ask again.
 */
export class ConsentManager {
    private granted = new Set<string>();
    private denied = new Set<string>();
    /** unanswered asks per service (preloaded slides stack several) */
    private pending = new Map<string, Array<{ el: HTMLElement; resolve: (v: boolean) => void }>>();
    /** the start-of-story dialog's row per service, so a decision made
     *  anywhere (including a standalone per-service ask) clears it */
    private startRows = new Map<string, HTMLElement>();
    /** every start-of-story dialog root we put on screen, so dispose() can
     *  take the whole thing down rather than just its rows */
    private startDialogs = new Set<HTMLElement>();
    /** set by dispose(); late answers are ignored rather than persisted */
    private disposed = false;

    constructor() {
        this.restore();
    }

    /**
     * Seed the per-service state from localStorage, if present.
     *
     * Keys written by an earlier version are remapped onto the namespaced
     * form, so an existing visitor is not asked everything again after the
     * upgrade. The remap is written back once, which also clears the legacy
     * keys so they cannot drift out of sync later.
     */
    private restore(): void {
        const { state, migrated } = readStoredState();
        for (const [key, allowed] of Object.entries(state)) {
            if (allowed) {
                this.granted.add(key);
            } else {
                this.denied.add(key);
            }
        }
        if (migrated) {
            this.persist();
        }
    }

    /**
     * Persist the per-service state to localStorage.
     *
     * A page can hold more than one viewer, and they all share this one
     * record — a visitor should not answer the same question twice for the
     * same service. So this *merges* into whatever is already stored instead
     * of replacing it: writing this viewer's full set back would silently
     * erase a decision a sibling viewer made, while that sibling still
     * believed otherwise. The merged result is then adopted, which is what
     * makes every viewer converge on the same decisions.
     */
    private persist(): void {
        const merged = readStoredState().state;
        for (const service of this.granted) merged[service] = true;
        for (const service of this.denied) merged[service] = false;
        writeStoredState(merged);
        this.adopt(merged);
    }

    /** Replace the in-memory decision set with `state`, in place. */
    private adopt(state: Record<string, boolean>): void {
        this.granted.clear();
        this.denied.clear();
        for (const [key, allowed] of Object.entries(state)) {
            if (allowed) {
                this.granted.add(key);
            } else {
                this.denied.add(key);
            }
        }
    }

    /**
     * Re-read the shared record, so a decision the visitor made in a sibling
     * viewer is honoured here without having to reconstruct this one.
     */
    private sync(): void {
        this.adopt(readStoredState().state);
    }

    /**
     * Record a decision for one service and resolve every ask waiting on it.
     *
     * Both dialog shapes funnel through here, which is what keeps a service
     * from ending up in the granted *and* the denied set: the opposite set is
     * always cleared.
     */
    private decide(service: string, allowed: boolean): void {
        if (this.disposed) {
            return;
        }
        if (allowed) {
            this.granted.add(service);
            this.denied.delete(service);
        } else {
            this.denied.add(service);
            this.granted.delete(service);
        }
        // Store before resolving. A resolved promise starts loading the media,
        // which asks again for the next service, and that ask re-reads the
        // shared record — so the decision has to be durable first.
        this.persist();

        // answering resolves every pending ask of that service (preloaded
        // slides ask in parallel)
        for (const pending of this.pending.get(service) ?? []) {
            pending.el.remove();
            pending.resolve(allowed);
        }
        this.pending.delete(service);
        // and the start-of-story dialog's row for it. The visitor can answer
        // the same service from the standalone ask over the map, so the row
        // cannot be cleaned up by its own click handler alone.
        this.startRows.get(service)?.remove();
        this.startRows.delete(service);
    }

    isGranted(service: string): boolean {
        return this.granted.has(service);
    }

    isDenied(service: string): boolean {
        return this.denied.has(service);
    }

    /** True when at least one of the services has no stored decision yet. */
    hasUnanswered(services: string[]): boolean {
        this.sync();
        return services.some((service) => !this.granted.has(service) && !this.denied.has(service));
    }

    /**
     * Start-of-story consent dialog: lists every known external service
     * with per-service Allow/Deny, plus global "Allow all" / "Decline
     * all" buttons. Individual decisions reuse the per-service state
     * (pending slide asks resolve immediately); the dialog closes once
     * every service has a decision.
     */
    requestAll(services: ConsentService[], container: HTMLElement): void {
        if (!this.hasUnanswered(services.map((s) => s.key))) {
            return;
        }
        // Only list the services still waiting on a decision. Rendering an
        // already-answered row invited the visitor to re-answer a question
        // they had settled on a previous visit — and, because the row shows
        // "map tiles", it made the tile consent look unanswered even when
        // localStorage said otherwise.
        const unanswered = services.filter(
            (s) => !this.granted.has(s.key) && !this.denied.has(s.key),
        );
        const messages = Language.messages;
        const el = Dom.create("div", "vco-consent vco-consent-start");
        const { title, message } = consentHeader(
            messages.consent_start_title ?? "External content",
            messages.consent_start_message ?? "",
        );

        const list = Dom.create("div", "vco-consent-services");
        const toggles: Array<{ key: string; allow: HTMLButtonElement; deny: HTMLButtonElement }> =
            [];

        const finish = () => {
            if (this.hasUnanswered(services.map((s) => s.key))) return;
            el.remove();
        };

        for (const service of unanswered) {
            const row = Dom.create("div", "vco-consent-service");
            const label = Dom.create("span", "vco-consent-service-label");
            label.textContent = service.label;
            const buttons = Dom.create("div", "vco-consent-buttons");
            const allow = consentButton("allow", messages.consent_allow ?? "Allow");
            const deny = consentButton("deny", messages.consent_deny ?? "Deny");

            const answer = (allowed: boolean) => {
                // decide() removes the row: a settled service must not keep
                // showing in the dialog
                this.decide(service.key, allowed);
                allow.disabled = true;
                deny.disabled = true;
                finish();
            };
            allow.addEventListener("click", () => answer(true));
            deny.addEventListener("click", () => answer(false));

            buttons.append(allow, deny);
            row.append(label, buttons);
            list.append(row);
            toggles.push({ key: service.key, allow, deny });
            this.startRows.set(service.key, row);
        }

        const actions = Dom.create("div", "vco-consent-buttons vco-consent-start-actions");
        const allowAll = consentButton("allow", messages.consent_allow_all ?? "Allow all");
        const declineAll = consentButton("deny", messages.consent_decline_all ?? "Decline all");

        const answerAll = (allowed: boolean) => {
            for (const toggle of toggles) {
                this.decide(toggle.key, allowed);
                toggle.allow.disabled = true;
                toggle.deny.disabled = true;
            }
            el.remove();
        };
        allowAll.addEventListener("click", () => answerAll(true));
        declineAll.addEventListener("click", () => answerAll(false));

        actions.append(allowAll, declineAll);
        el.append(title, message, list, actions);
        container.append(el);
        this.startDialogs.add(el);
    }

    /**
     * Ask the visitor for permission to load `service`, optionally naming the
     * `host` (shown in parentheses so they can see which domain is about to be
     * contacted). The ask is rendered into `container`; resolves
     * `true`/`false` on the visitor's decision, or immediately when the
     * service was already granted or denied.
     *
     * The service is stored and looked up by `service.key`; `service.label`
     * is only ever rendered.
     */
    request(service: ConsentService, host: string, container: HTMLElement): Promise<boolean> {
        const key = service.key;
        // the record is shared with any sibling viewer on the page, so re-read
        // it: a decision the visitor just made over there answers this ask
        // without showing a second dialog for the same service
        this.sync();
        if (this.granted.has(key)) return Promise.resolve(true);
        if (this.denied.has(key)) return Promise.resolve(false);
        return new Promise((resolve) => {
            const messages = Language.messages;
            const el = Dom.create("div", "vco-consent");

            const template = messages.consent_message ?? "Load content from {service}?";
            const { title, message } = consentHeader(
                // consent_title was byte-identical to consent_start_title and
                // present in no other locale, so the per-service panel reuses
                // the start-of-story heading
                messages.consent_start_title ?? "External content",
                template.replace("{service}", service.label) + (host ? ` (${host})` : ""),
            );

            const buttons = Dom.create("div", "vco-consent-buttons");
            const allow = consentButton("allow", messages.consent_allow ?? "Allow");
            const deny = consentButton("deny", messages.consent_deny ?? "Deny");

            const list = this.pending.get(key) ?? [];
            list.push({ el, resolve });
            this.pending.set(key, list);

            const answer = (allowed: boolean) => this.decide(key, allowed);
            allow.addEventListener("click", () => answer(true));
            deny.addEventListener("click", () => answer(false));

            buttons.append(allow, deny);
            el.append(title, message, buttons);
            container.append(el);
        });
    }

    /**
     * Release everything: drop the dialogs and settle every unanswered ask.
     *
     * `Media.loadMedia()` awaits `request()`. Without this, tearing the viewer
     * down while a panel was on screen left that `await` pending forever, and
     * the suspended frame kept the whole media subtree — DOM included — alive.
     * Unanswered asks resolve `false`, which is the same outcome as declining.
     */
    dispose(): void {
        this.disposed = true;
        // the whole dialog, not just the rows: removing the rows leaves the
        // heading and the allow-all/deny-all buttons behind
        for (const el of this.startDialogs) {
            el.remove();
        }
        this.startDialogs.clear();
        this.startRows.clear();
        for (const [, asks] of this.pending) {
            for (const ask of asks) {
                ask.el.remove();
                ask.resolve(false);
            }
        }
        this.pending.clear();
    }
}

/**
 * The consent manager attached to a StoryMap's options object, or
 * `undefined` when absent.
 */
export function consentManagerOf(options: unknown): ConsentManager | undefined {
    return (options as { consent_manager?: ConsentManager })?.consent_manager;
}

/**
 * A localized consent string, falling back to the English default.
 */
export function consentMessage(key: string, fallback: string): string {
    return Language.messages[key] ?? fallback;
}
