import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Compatibility surface for pre-0.10 (Knight Lab) code. The map/marker
 * methods of the original viewer are kept as thin wrappers, and the ones that
 * were already no-ops upstream stay no-ops — a wrapper that silently starts
 * doing something would be a worse surprise than one that does nothing.
 */
describe("legacy container methods", () => {
    beforeAll(() => {
        // OpenLayers requires ResizeObserver which jsdom does not provide
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymap(id: string): StoryMap {
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
                        text: { headline: "Paris", text: "" },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
    }

    /** The engine's container is the .vco-map div the host element holds. */
    function mapContainer(sm: StoryMap): HTMLElement {
        const host = document.getElementById("sm-legacy");
        const map_el = host?.querySelector(":scope > .vco-map") as HTMLElement;
        expect(map_el).not.toBeNull();
        return map_el;
    }

    it("addTo moves the map into another element and fires added", () => {
        const sm = storymap("sm-legacy");
        const engine = (
            sm as unknown as {
                _map: {
                    addTo(el: HTMLElement): unknown;
                    _el: { container: HTMLElement; map: HTMLElement };
                    _map: { getTargetElement(): HTMLElement | undefined };
                };
            }
        )._map;
        const container = mapContainer(sm);
        const events: string[] = [];
        sm._map.on("added", () => events.push("added"));

        const target = document.createElement("div");
        document.body.appendChild(target);
        engine.addTo(target);

        expect(container.parentElement).toBe(target);
        expect(events).toEqual(["added"]);
        // the OpenLayers viewport is re-attached and re-measured
        expect(engine._map.getTargetElement()).toBe(engine._el.map);

        sm.dispose();
    });

    it("removeFrom detaches the map, and addTo brings it back", () => {
        const sm = storymap("sm-legacy");
        const engine = (
            sm as unknown as {
                _map: {
                    addTo(el: HTMLElement): unknown;
                    removeFrom(el: HTMLElement): unknown;
                    _el: { container: HTMLElement; map: HTMLElement };
                    _map: { getTargetElement(): HTMLElement | undefined };
                };
            }
        )._map;
        const container = mapContainer(sm);
        const events: string[] = [];
        sm._map.on("removed", () => events.push("removed"));

        const target = document.createElement("div");
        document.body.appendChild(target);
        engine.addTo(target);
        engine.removeFrom(target);

        expect(container.parentElement).toBeNull();
        expect(events).toEqual(["removed"]);
        // nothing renders into the detached node
        expect(engine._map.getTargetElement()).toBeUndefined();

        // re-adding re-targets, so a move is reversible
        engine.addTo(target);
        expect(container.parentElement).toBe(target);
        expect(engine._map.getTargetElement()).toBe(engine._el.map);

        sm.dispose();
    });

    it("still throws when the argument is not the current parent", () => {
        const sm = storymap("sm-legacy");
        const engine = (
            sm as unknown as {
                _map: { removeFrom(el: HTMLElement): unknown };
            }
        )._map;
        const elsewhere = document.createElement("div");
        document.body.appendChild(elsewhere);
        // parity with the original (and DomMixed): a wrong parent is a
        // DOM NotFoundError, not a silent detach
        expect(() => engine.removeFrom(elsewhere)).toThrow();
        sm.dispose();
    });
});

describe("legacy marker no-ops", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function markers(id: string): StoryMap {
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
                        text: { headline: "Paris", text: "" },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
    }

    it("createPopup does nothing and does not throw", () => {
        const sm = markers("sm-legacy-marker");
        const marker = sm.getMarker(1);
        expect(marker).not.toBeNull();
        const before = document.querySelectorAll(".vco-mapmarker").length;
        expect(() =>
            (
                marker as unknown as {
                    createPopup(d?: unknown, o?: unknown): void;
                }
            ).createPopup(),
        ).not.toThrow();
        expect(document.querySelectorAll(".vco-mapmarker").length).toBe(before);
        sm.dispose();
    });

    it("show/hide stay no-ops", () => {
        const sm = markers("sm-legacy-nops");
        const marker = sm.getMarker(1) as unknown as {
            show(): void;
            hide(): void;
            _marker: HTMLElement;
        };
        expect(() => marker.show()).not.toThrow();
        expect(() => marker.hide()).not.toThrow();
        // no display juggling, the marker element is untouched
        expect(marker._marker.style.display).toBe("");
        sm.dispose();
    });
});
