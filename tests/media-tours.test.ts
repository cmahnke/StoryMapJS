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
        openPopup(): boolean;
        togglePopup(): boolean;
        closePopup(): void;
        dispose(): void;
    };

    it("stays closed when the marker has no popup", () => {
        const sm = storymap("sm-popup-off", false);
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        expect(marker.togglePopup()).toBe(false);
        expect(marker.popupOpen).toBe(false);
        expect(marker._marker.querySelector(".vco-marker-popup")).toBeNull();
        sm.dispose();
    });

    it("toggles a card with a sanitized headline, excerpt and thumb", () => {
        const sm = storymap("sm-popup-on", true);
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        marker.togglePopup();
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
        marker.togglePopup();
        const card = marker._marker.querySelector(".vco-marker-popup") as HTMLElement;
        expect(card.querySelector("[onerror]")).toBeNull();
        expect(card.querySelector("script")).toBeNull();
        expect((window as unknown as { __xss?: number }).__xss, "no handler ran").toBeUndefined();
        sm.dispose();
    });

    it("closes on deactivate and on Escape", () => {
        const sm = storymap("sm-popup-close", true);
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        marker.togglePopup();
        expect(marker.popupOpen).toBe(true);

        marker.togglePopup();
        expect(marker.popupOpen).toBe(false);

        marker.togglePopup();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        expect(marker.popupOpen).toBe(false);
        sm.dispose();
    });

    it("is released by dispose(), listener included", () => {
        const sm = storymap("sm-popup-dispose", true);
        const marker = sm.getMarker(1) as unknown as MarkerInternals;
        marker.togglePopup();
        expect(marker.popupOpen).toBe(true);
        marker.dispose();
        expect(marker.popupOpen).toBe(false);
        // the keydown listener is gone: opening again is impossible, and no
        // stale handler survives to touch a dead marker
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        sm.dispose();
    });
});

describe("StoryMap marker popup API", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymap(id: string, popup: boolean): StoryMap {
        // Each test builds its own viewer on a shared jsdom page, and every
        // navigation rewrites `#slide-N` into the URL — which the next
        // constructor would read as a deep link. Clear it so every viewer
        // starts on the overview.
        window.location.hash = "";
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
                        text: { headline: "Paris", text: "<p>Body.</p>" },
                        location: { lat: 48.85, lon: 2.35 },
                        marker: { popup },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
    }

    function eventsOf(
        sm: StoryMap,
        type: "popupopen" | "popupclose" | "markerclick",
    ): { marker_number: number; current_slide: number }[] {
        const seen: { marker_number: number; current_slide: number }[] = [];
        sm.on(type, (e) =>
            seen.push({ marker_number: e.marker_number, current_slide: e.current_slide }),
        );
        return seen;
    }

    it("openMarkerPopup navigates to the slide and opens the card", () => {
        const sm = storymap("sm-api-open", true);
        expect(sm.openMarkerPopup(1)).toBe(true);
        expect(sm.current_slide).toBe(1);
        expect(sm.isPopupOpen(1)).toBe(true);
        const marker = sm.getMarker(1) as unknown as { _marker: HTMLElement };
        expect(marker._marker.querySelector(".vco-marker-popup")).not.toBeNull();
        sm.dispose();
    });

    it("openMarkerPopup returns false without navigating when disabled", () => {
        const sm = storymap("sm-api-disabled", false);
        expect(sm.openMarkerPopup(1)).toBe(false);
        // ... and changes nothing: still on the overview, nothing open
        expect(sm.current_slide).toBe(0);
        expect(sm.isPopupOpen(1)).toBe(false);
        sm.dispose();
    });

    it("openMarkerPopup returns false for out-of-range and overview slides", () => {
        const sm = storymap("sm-api-range", true);
        expect(sm.openMarkerPopup(99)).toBe(false);
        expect(sm.openMarkerPopup(-1)).toBe(false);
        expect(sm.openMarkerPopup(1.5)).toBe(false);
        // slide 0 is the overview: no real marker, no card
        expect(sm.openMarkerPopup(0)).toBe(false);
        expect(sm.current_slide).toBe(0);
        sm.dispose();
    });

    it("closeMarkerPopup closes one card, or all when omitted", () => {
        const sm = storymap("sm-api-close", true);
        expect(sm.openMarkerPopup(1)).toBe(true);
        sm.closeMarkerPopup(1);
        expect(sm.isPopupOpen(1)).toBe(false);
        expect(sm.openMarkerPopup(1)).toBe(true);
        sm.closeMarkerPopup();
        expect(sm.isPopupOpen(1)).toBe(false);
        sm.dispose();
    });

    it("closing on deactivate fires popupclose", () => {
        const sm = storymap("sm-api-deactivate", true);
        const closed = eventsOf(sm, "popupclose");
        expect(sm.openMarkerPopup(1)).toBe(true);
        sm.goTo(0);
        expect(sm.isPopupOpen(1)).toBe(false);
        expect(closed.length).toBe(1);
        expect(closed[0]?.marker_number).toBe(1);
        sm.dispose();
    });

    it("fires popupopen with the marker number and current slide", () => {
        const sm = storymap("sm-api-events", true);
        const opened = eventsOf(sm, "popupopen");
        expect(sm.openMarkerPopup(1)).toBe(true);
        expect(opened.length).toBe(1);
        expect(opened[0]).toMatchObject({ marker_number: 1, current_slide: 1 });
        sm.dispose();
    });

    it("re-fires markerclick from a marker click", () => {
        const sm = storymap("sm-api-click", true);
        expect(sm.current_slide).toBe(0);
        const clicked = eventsOf(sm, "markerclick");
        // marker 1 is inactive, so the click navigates (rather than toggling
        // the popup, which is what a click on the *active* marker does)
        const marker = sm.getMarker(1) as unknown as { _marker: HTMLElement };
        marker._marker.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(clicked.length).toBe(1);
        expect(clicked[0]?.marker_number).toBe(1);
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
