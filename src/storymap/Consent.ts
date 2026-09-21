import { Language } from "../language/Language";

/**
 * Per-StoryMap GDPR consent manager. When the `consent_required` option is
 * set, every external service (media embeds, map tiles, external font CSS)
 * asks for permission before anything is loaded. Grants and denials are
 * remembered per service for the lifetime of the page — nothing is
 * persisted, so each page load asks again.
 */
export class ConsentManager {
    private granted = new Set<string>();
    private denied = new Set<string>();
    /** unanswered asks per service (preloaded slides stack several) */
    private pending = new Map<string, Array<{ el: HTMLElement; resolve: (v: boolean) => void }>>();

    isGranted(service: string): boolean {
        return this.granted.has(service);
    }

    isDenied(service: string): boolean {
        return this.denied.has(service);
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
