import { Language } from "../language/Language";
import Dom from "../dom/Dom";

/** localStorage key holding the per-service consent state (JSON). */
const CONSENT_STORAGE_KEY = "storymapjs-consent";

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

    constructor() {
        this.restore();
    }

    /** Seed the per-service state from localStorage, if present. */
    private restore(): void {
        try {
            const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
            if (!raw) return;
            const state = JSON.parse(raw) as Record<string, boolean>;
            for (const service in state) {
                if (Object.hasOwn(state, service)) {
                    if (state[service]) {
                        this.granted.add(service);
                    } else {
                        this.denied.add(service);
                    }
                }
            }
        } catch {
            // ignore malformed or unavailable storage
        }
    }

    /** Persist the per-service state to localStorage. */
    private persist(): void {
        const state: Record<string, boolean> = {};
        for (const service of this.granted) state[service] = true;
        for (const service of this.denied) state[service] = false;
        try {
            window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
        } catch {
            // storage unavailable (e.g. sandboxed contexts)
        }
    }

    /**
     * Record a decision for one service and resolve every ask waiting on it.
     *
     * Both dialog shapes funnel through here, which is what keeps a service
     * from ending up in the granted *and* the denied set: the opposite set is
     * always cleared.
     */
    private decide(service: string, allowed: boolean): void {
        if (allowed) {
            this.granted.add(service);
            this.denied.delete(service);
        } else {
            this.denied.add(service);
            this.granted.delete(service);
        }
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
        this.persist();
    }

    isGranted(service: string): boolean {
        return this.granted.has(service);
    }

    isDenied(service: string): boolean {
        return this.denied.has(service);
    }

    /** True when at least one of the services has no stored decision yet. */
    hasUnanswered(services: string[]): boolean {
        return services.some((service) => !this.granted.has(service) && !this.denied.has(service));
    }

    /**
     * Start-of-story consent dialog: lists every known external service
     * with per-service Allow/Deny, plus global "Allow all" / "Decline
     * all" buttons. Individual decisions reuse the per-service state
     * (pending slide asks resolve immediately); the dialog closes once
     * every service has a decision.
     */
    requestAll(services: Array<{ key: string; label: string }>, container: HTMLElement): void {
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
    }

    /**
     * Ask the visitor for permission to load `service` (a human-readable
     * name like "YouTube" or "map tiles"), optionally naming the `host`.
     * The ask is rendered into `container`; resolves `true`/`false` on the
     * visitor's decision, or immediately when the service was already
     * granted or denied.
     */
    request(service: string, host: string, container: HTMLElement): Promise<boolean> {
        if (this.granted.has(service)) return Promise.resolve(true);
        if (this.denied.has(service)) return Promise.resolve(false);
        return new Promise((resolve) => {
            const messages = Language.messages;
            const el = Dom.create("div", "vco-consent");

            const template = messages.consent_message ?? "Load content from {service}?";
            const { title, message } = consentHeader(
                messages.consent_title ?? "External content",
                template.replace("{service}", service) + (host ? ` (${host})` : ""),
            );

            const buttons = Dom.create("div", "vco-consent-buttons");
            const allow = consentButton("allow", messages.consent_allow ?? "Allow");
            const deny = consentButton("deny", messages.consent_deny ?? "Deny");

            const list = this.pending.get(service) ?? [];
            list.push({ el, resolve });
            this.pending.set(service, list);

            const answer = (allowed: boolean) => this.decide(service, allowed);
            allow.addEventListener("click", () => answer(true));
            deny.addEventListener("click", () => answer(false));

            buttons.append(allow, deny);
            el.append(title, message, buttons);
            container.append(el);
        });
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

/**
 * The ask name the map code uses for its tile layers. Every tile-layer
 * creation site (base map, overlays, minimap, overview) keys off this same
 * string, so it is resolved once here rather than re-derived at each of them.
 */
export function tileServiceName(): string {
    return consentMessage("consent_service_tiles", "map tiles");
}
