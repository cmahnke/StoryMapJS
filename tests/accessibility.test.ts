import { beforeAll, describe, expect, it, vi } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import Message from "../src/ui/Message";
import { setLanguage } from "../src/language/Language";
import { buildIframe } from "../src/media/EmbedUtil";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Accessibility chrome: skip link, autoplay toggle, language emission,
 * message semantics, load-error alerts, marker keyboard access and
 * iframe naming. Behavioural coverage for the README Accessibility
 * section; the full matrix lives in e2e/accessibility-*.spec.ts.
 */

describe("accessibility chrome", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymap(
        id: string,
        story: Record<string, unknown>,
        options: Record<string, unknown> = {},
    ): StoryMap {
        window.location.hash = "";
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(
            id,
            { storymap: story } as unknown as StorymapDataWrapper,
            options as never,
        );
    }

    function slides(): { headline: string; text: string }[] {
        return [
            { date: "", type: "overview", text: { headline: "Overview", text: "" } },
            {
                date: "",
                text: { headline: "Paris", text: "Body." },
                location: { lat: 48.85, lon: 2.35 },
            },
        ] as never;
    }

    it("renders a skip link to the slide content", () => {
        const sm = storymap("sm-a11y-skip", { map_type: "osm", slides: slides() });
        const link = document.querySelector(
            "#sm-a11y-skip > a.vco-skip-link",
        ) as HTMLAnchorElement | null;
        expect(link).not.toBeNull();
        expect(link?.getAttribute("href")).toBe("#sm-a11y-skip-slides");
        expect(document.querySelector("#sm-a11y-skip-slides")).not.toBeNull();
        sm.dispose();
    });

    it("toggles autoplay from the menubar and reflects the state", () => {
        const sm = storymap(
            "sm-a11y-autoplay",
            { map_type: "osm", slides: slides() },
            { autoplay: 60000 },
        );
        const button = document.querySelector(
            "#sm-a11y-autoplay button.vco-menubar-autoplay",
        ) as HTMLButtonElement | null;
        expect(button).not.toBeNull();
        expect(button?.getAttribute("aria-pressed")).toBe("true");
        button?.click();
        expect((sm as unknown as { _autoplay_stopped: boolean })._autoplay_stopped).toBe(true);
        expect(button?.getAttribute("aria-pressed")).toBe("false");
        button?.click();
        expect((sm as unknown as { _autoplay_stopped: boolean })._autoplay_stopped).toBe(false);
        sm.dispose();
    });

    it("omits the autoplay toggle without autoplay", () => {
        const sm = storymap("sm-a11y-noautoplay", { map_type: "osm", slides: slides() });
        expect(
            document.querySelector("#sm-a11y-noautoplay button.vco-menubar-autoplay"),
        ).toBeNull();
        sm.dispose();
    });

    it("syncs the document language with the viewer language", () => {
        setLanguage("de");
        try {
            expect(document.documentElement.getAttribute("lang")).toBe("de");
        } finally {
            setLanguage("en");
        }
        expect(document.documentElement.getAttribute("lang")).toBe("en");
    });

    it("renders per-slide language as lang attributes", () => {
        const sm = storymap("sm-a11y-lang", {
            map_type: "osm",
            language: "de",
            slides: [
                { date: "", type: "overview", text: { headline: "Überblick", text: "" } },
                {
                    date: "",
                    text: { headline: "Paris", text: "Text." },
                    language: "fr",
                    location: { lat: 48.85, lon: 2.35 },
                },
            ],
        });
        const texts = Array.from(
            document.querySelectorAll("#sm-a11y-lang .vco-text"),
        ) as HTMLElement[];
        expect(texts.length).toBeGreaterThan(0);
        expect(texts[1]?.getAttribute("lang")).toBe("fr");
        sm.dispose();
        setLanguage("en");
    });

    it("exposes the message as a labelled button", () => {
        const message = new Message({}, { message_class: "vco-message" });
        const el = (message as unknown as { _el: { container: HTMLElement } })._el.container;
        expect(el.getAttribute("role")).toBe("button");
        expect(el.getAttribute("tabindex")).toBe("0");
        expect(el.getAttribute("aria-label")).not.toBe("");
        let clicked = 0;
        (message as unknown as { on(t: string, fn: () => void): void }).on("clicked", () => {
            clicked++;
        });
        el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        expect(clicked).toBe(1);
        message.dispose();
    });

    it("announces media load errors with role=alert", async () => {
        const sm = storymap("sm-a11y-mediaerror", {
            map_type: "osm",
            slides: [
                { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                {
                    date: "",
                    text: { headline: "Broken", text: "Body." },
                    // no /status/ segment: extraction throws inside the
                    // load timer and the viewer shows its error display
                    media: { url: "https://twitter.com/someuser" },
                    location: { lat: 48.85, lon: 2.35 },
                },
            ],
        });
        await vi.waitFor(
            () => {
                const el = document.querySelector(
                    "#sm-a11y-mediaerror .vco-media-loaderror",
                ) as HTMLElement | null;
                expect(el?.getAttribute("role")).toBe("alert");
            },
            { timeout: 15_000 },
        );
        sm.dispose();
    }, 25_000);

    it("makes markers keyboard-operable with labels", () => {
        const sm = storymap("sm-a11y-marker", { map_type: "osm", slides: slides() });
        const marker = sm.getMarker(1) as unknown as { _marker: HTMLElement };
        expect(marker._marker.getAttribute("tabindex")).toBe("0");
        expect(marker._marker.getAttribute("role")).toBe("button");
        expect(marker._marker.getAttribute("aria-label")).toContain("Paris");
        marker._marker.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        expect(sm.current_slide).toBe(1);
        sm.dispose();
    });

    it("names nameless iframes for assistive tech", () => {
        const iframe = buildIframe("https://example.com/embed.html");
        expect(iframe?.getAttribute("title")).toBe("Embedded media");
        const named = buildIframe(
            '<iframe src="https://example.com/e.html" title="Custom"></iframe>',
        );
        expect(named?.getAttribute("title")).toBe("Custom");
    });
});
