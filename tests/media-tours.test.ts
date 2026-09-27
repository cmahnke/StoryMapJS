import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper, StorymapSlideMarker } from "../src/types";

/**
 * §2 of docs/plans/iiif-media-tours.md: per-slide marker config (`marker.*`
 * winning over the legacy `location.*`), the popup card, the audio badge,
 * subtitles, narration and media-aware autoplay.
 */

describe("marker config", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymap(id: string, extra: Record<string, unknown> = {}): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(id, {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Paris", text: "Body text." },
                        location: { lat: 48.85, lon: 2.35 },
                        ...extra,
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
    }

    type MarkerInternals = {
        _presentation(d?: unknown): {
            icon?: string;
            iconSize?: number[];
            image?: string;
            label?: string;
            popup: boolean;
            audioBadge: boolean;
            useCustomMarker?: boolean;
        };
    };

    function presentationOf(sm: StoryMap): ReturnType<MarkerInternals["_presentation"]> {
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        return marker._presentation((sm.data.slides[1] ?? {}) as never);
    }

    it("falls back to location.* when there is no marker config", () => {
        const sm = storymap("sm-marker-legacy", {
            location: { lat: 48.85, lon: 2.35, icon: "https://x/icon.png", iconSize: [30, 40] },
        });
        const p = presentationOf(sm);
        expect(p.icon).toBe("https://x/icon.png");
        expect(p.iconSize).toEqual([30, 40]);
        expect(p.label).toBeUndefined();
        expect(p.popup).toBe(false);
        sm.dispose();
    });

    it("takes the label from the navPlace name property", () => {
        // in a manifest the label arrives as properties.name
        const sm = storymap("sm-marker-name", {
            location: { lat: 48.85, lon: 2.35, name: "The tower" },
        });
        expect(presentationOf(sm).label).toBe("The tower");
        sm.dispose();
    });

    it("lets marker.* win over location.*", () => {
        const sm = storymap("sm-marker-wins", {
            location: { lat: 48.85, lon: 2.35, icon: "https://x/old.png" },
            marker: {
                icon: "https://x/new.png",
                label: "New label",
                popup: true,
            } as StorymapSlideMarker,
        });
        const p = presentationOf(sm);
        expect(p.icon).toBe("https://x/new.png");
        expect(p.label).toBe("New label");
        expect(p.popup).toBe(true);
        sm.dispose();
    });

    it("reads the presentation flags off the properties bag", () => {
        const sm = storymap("sm-marker-flags", {
            location: { lat: 48.85, lon: 2.35, popup: true, audioBadge: true },
        });
        const p = presentationOf(sm);
        expect(p.popup).toBe(true);
        expect(p.audioBadge).toBe(true);
        sm.dispose();
    });
});

describe("marker popup", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymap(id: string, popup: boolean): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(id, {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Paris", text: "<p>Body with <em>markup</em>.</p>" },
                        location: { lat: 48.85, lon: 2.35 },
                        media: {
                            url: "https://example.org/i.jpg",
                            thumb: "https://example.org/t.jpg",
                        },
                        marker: { popup, audioBadge: true },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
    }

    type MarkerInternals = {
        _marker: HTMLElement;
        popupOpen: boolean;
        _togglePopup(): void;
        _closePopup(): void;
        dispose(): void;
    };

    it("stays closed when the marker has no popup", () => {
        const sm = storymap("sm-popup-off", false);
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        marker._togglePopup();
        expect(marker.popupOpen).toBe(false);
        expect(marker._marker.querySelector(".vco-marker-popup")).toBeNull();
        sm.dispose();
    });

    it("toggles a card with a sanitized headline, excerpt and thumb", () => {
        const sm = storymap("sm-popup-on", true);
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        marker._togglePopup();
        expect(marker.popupOpen).toBe(true);

        const card = marker._marker.querySelector(".vco-marker-popup") as HTMLElement;
        expect(card).not.toBeNull();
        expect(card.querySelector(".vco-marker-popup-headline")?.textContent).toBe("Paris");
        // the excerpt keeps its markup, sanitized
        expect(card.querySelector("em")?.textContent).toBe("markup");
        const thumb = card.querySelector(".vco-marker-popup-thumb") as HTMLImageElement;
        expect(thumb.getAttribute("src")).toBe("https://example.org/t.jpg");
        // and a close control that is a real button
        const close = card.querySelector(".vco-marker-popup-close") as HTMLButtonElement;
        expect(close.tagName).toBe("BUTTON");
        close.click();
        expect(marker.popupOpen).toBe(false);
        sm.dispose();
    });

    it("drops script markup from the card", () => {
        const el = document.createElement("div");
        el.id = "sm-popup-xss";
        document.body.appendChild(el);
        const sm = new StoryMap("sm-popup-xss", {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: {
                            headline: '<img src=x onerror="window.__xss=1">',
                            text: "<script>window.__xss2=1</script>ok",
                        },
                        location: { lat: 48.85, lon: 2.35 },
                        marker: { popup: true },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        marker._togglePopup();
        const card = marker._marker.querySelector(".vco-marker-popup") as HTMLElement;
        expect(card.querySelector("[onerror]")).toBeNull();
        expect(card.querySelector("script")).toBeNull();
        expect((window as unknown as { __xss?: number }).__xss, "no handler ran").toBeUndefined();
        sm.dispose();
    });

    it("closes on deactivate and on Escape", () => {
        const sm = storymap("sm-popup-close", true);
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        marker._togglePopup();
        expect(marker.popupOpen).toBe(true);

        marker._togglePopup();
        expect(marker.popupOpen).toBe(false);

        marker._togglePopup();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        expect(marker.popupOpen).toBe(false);
        sm.dispose();
    });

    it("is released by dispose(), listener included", () => {
        const sm = storymap("sm-popup-dispose", true);
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        marker._togglePopup();
        expect(marker.popupOpen).toBe(true);
        marker.dispose();
        expect(marker.popupOpen).toBe(false);
        // the keydown listener is gone: opening again is impossible, and no
        // stale handler survives to touch a dead marker
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        sm.dispose();
    });
});

describe("subtitles and media events", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    it("adds a subtitles track for an audio slide", () => {
        const el = document.createElement("div");
        el.id = "sm-subs";
        document.body.appendChild(el);
        const sm = new StoryMap("sm-subs", {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Talk", text: "" },
                        media: {
                            url: "https://example.org/a.mp3",
                            subtitles: "https://example.org/a.vtt",
                        },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);

        const marker_media = (
            sm as unknown as {
                _storyslider: {
                    _slides: { _media?: { _loadMedia?(): void; player_element?: HTMLElement } }[];
                };
            }
        )._storyslider._slides[1]._media;
        marker_media?._loadMedia?.();
        const audio = marker_media?.player_element as HTMLAudioElement | undefined;
        expect(audio?.tagName).toBe("AUDIO");
        const track = audio?.querySelector("track");
        expect(track?.getAttribute("kind")).toBe("subtitles");
        expect(track?.getAttribute("src")).toBe("https://example.org/a.vtt");
        sm.dispose();
    });
});
