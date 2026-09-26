import { Language } from "../language/Language";

/** localStorage key holding the per-service consent state (JSON). */
const CONSENT_STORAGE_KEY = "storymapjs-consent";

/**
 * Per-StoryMap GDPR consent manager. When the `consent_required` option is
 * set, every external service (media embeds, map tiles, external font CSS)
 * asks for permission before anything is loaded. Decisions are remembered
 * per service in localStorage for 90 days — clearing site data asks again.
 */
export class ConsentManager {
    private granted = new Set<string>();
    private denied = new Set<string>();
    /** unanswered asks per service (preloaded slides stack several) */
    private pending = new Map<string, Array<{ el: HTMLElement; resolve: (v: boolean) => void }>>();

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
        const messages = (Language.messages ?? {}) as Record<string, string>;
        const el = document.createElement("div");
        el.className = "vco-consent vco-consent-start";

        const title = document.createElement("p");
        title.className = "vco-consent-title";
        title.textContent = messages.consent_start_title ?? "External content";

        const message = document.createElement("p");
        message.className = "vco-consent-message";
        message.textContent = messages.consent_start_message ?? "";

        const list = document.createElement("div");
        list.className = "vco-consent-services";
        const toggles: Array<{ key: string; allow: HTMLButtonElement; deny: HTMLButtonElement }> =
            [];

        const decide = (service: string, allowed: boolean) => {
            if (allowed) {
                this.granted.add(service);
                this.denied.delete(service);
            } else {
                this.denied.add(service);
                this.granted.delete(service);
            }
            // answering resolves every pending slide ask of that service
            for (const p of this.pending.get(service) ?? []) {
                p.el.remove();
                p.resolve(allowed);
            }
            this.pending.delete(service);
            this.persist();
        };

        const finish = () => {
            if (this.hasUnanswered(services.map((s) => s.key))) return;
            el.remove();
        };

        for (const service of services) {
            const row = document.createElement("div");
            row.className = "vco-consent-service";
            const label = document.createElement("span");
            label.className = "vco-consent-service-label";
            label.textContent = service.label;
            const buttons = document.createElement("div");
            buttons.className = "vco-consent-buttons";
            const allow = document.createElement("button");
            allow.className = "vco-consent-allow";
            allow.setAttribute("type", "button");
            allow.textContent = messages.consent_allow ?? "Allow";
            const deny = document.createElement("button");
            deny.className = "vco-consent-deny";
            deny.setAttribute("type", "button");
            deny.textContent = messages.consent_deny ?? "Deny";
            allow.addEventListener("click", () => {
                decide(service.key, true);
                allow.disabled = true;
                deny.disabled = true;
                finish();
            });
            deny.addEventListener("click", () => {
                decide(service.key, false);
                allow.disabled = true;
                deny.disabled = true;
                finish();
            });
            buttons.append(allow, deny);
            row.append(label, buttons);
            list.append(row);
            toggles.push({ key: service.key, allow, deny });
        }

        const actions = document.createElement("div");
        actions.className = "vco-consent-buttons vco-consent-start-actions";
        const allowAll = document.createElement("button");
        allowAll.className = "vco-consent-allow";
        allowAll.setAttribute("type", "button");
        allowAll.textContent = messages.consent_allow_all ?? "Allow all";
        const declineAll = document.createElement("button");
        declineAll.className = "vco-consent-deny";
        declineAll.setAttribute("type", "button");
        declineAll.textContent = messages.consent_decline_all ?? "Decline all";
        allowAll.addEventListener("click", () => {
            for (const t of toggles) {
                decide(t.key, true);
                t.allow.disabled = true;
                t.deny.disabled = true;
            }
            el.remove();
        });
        declineAll.addEventListener("click", () => {
            for (const t of toggles) {
                decide(t.key, false);
                t.allow.disabled = true;
                t.deny.disabled = true;
            }
            el.remove();
        });
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
            const messages = (Language.messages ?? {}) as Record<string, string>;
            const el = document.createElement("div");
            el.className = "vco-consent";

            const title = document.createElement("p");
            title.className = "vco-consent-title";
            title.textContent = messages.consent_title ?? "External content";

            const message = document.createElement("p");
            message.className = "vco-consent-message";
            const template = messages.consent_message ?? "Load content from {service}?";
            message.textContent =
                template.replace("{service}", service) + (host ? ` (${host})` : "");

            const buttons = document.createElement("div");
            buttons.className = "vco-consent-buttons";

            const allow = document.createElement("button");
            allow.className = "vco-consent-allow";
            allow.textContent = messages.consent_allow ?? "Allow";

            const deny = document.createElement("button");
            deny.className = "vco-consent-deny";
            deny.textContent = messages.consent_deny ?? "Deny";

            const list = this.pending.get(service) ?? [];
            list.push({ el, resolve });
            this.pending.set(service, list);

            const decide = (allowed: boolean) => {
                if (allowed) {
                    this.granted.add(service);
                } else {
                    this.denied.add(service);
                }
                // answering one ask resolves every pending ask of the same
                // service (preloaded slides ask in parallel)
                for (const p of this.pending.get(service) ?? []) {
                    p.el.remove();
                    p.resolve(allowed);
                }
                this.pending.delete(service);
                this.persist();
            };
            allow.addEventListener("click", () => decide(true));
            deny.addEventListener("click", () => decide(false));

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
    return ((Language.messages ?? {}) as Record<string, string>)[key] ?? fallback;
}
