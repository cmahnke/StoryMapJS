import { beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

describe("storymap dispose()", () => {
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
                calculate_zoom: true,
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

    it("removes every window/document listener it added", () => {
        // record what the viewer attaches, then check dispose() takes it all
        // off again (which types are attached depends on the options: global
        // keydown is opt-in, hashchange only after the first slide).
        // Only the types StoryMap alone registers are in scope: jsdom's own
        // CSS engine attaches focus/keydown/mouse listeners on window (and
        // never removes them), and OL disposes the ones it added.
        const owned = new Set(["resize", "fullscreenchange", "hashchange"]);
        const added: { target: EventTarget; type: string; fn: EventListener }[] = [];
        const targets = [window, document] as EventTarget[];
        const originals = targets.map((t) => ({
            target: t,
            add: t.addEventListener.bind(t),
            remove: t.removeEventListener.bind(t),
        }));
        for (const { target, add } of originals) {
            target.addEventListener = ((type: string, fn: EventListener, o?: unknown) => {
                if (owned.has(type)) added.push({ target, type, fn });
                add(type, fn as EventListener, o as AddEventListenerOptions);
            }) as typeof target.addEventListener;
        }

        const removals: { target: EventTarget; type: string; fn: EventListener }[] = [];
        for (const { target, remove } of originals) {
            target.removeEventListener = ((type: string, fn: EventListener) => {
                if (owned.has(type)) removals.push({ target, type, fn });
                remove(type, fn);
            }) as typeof target.removeEventListener;
        }

        const sm = storymap("sm-dispose-listeners");
        sm.dispose();

        // every listener the viewer attached is taken off again, with the
        // very same function reference (this is why they are stored)
        expect(added.length).toBeGreaterThan(0);
        for (const entry of added) {
            expect(removals).toContainEqual(entry);
        }
        // resize and fullscreenchange are always registered
        expect(added.map((a) => a.type)).toContain("resize");
        expect(added.map((a) => a.type)).toContain("fullscreenchange");

        for (const { target, add, remove } of originals) {
            target.addEventListener = add;
            target.removeEventListener = remove;
        }
    });

    it("clears storymap.map and is safe to call twice", () => {
        const sm = storymap("sm-dispose-twice");
        expect(sm.map).not.toBeNull();
        sm.dispose();
        expect(sm.map).toBeNull();
        // a second call must not throw (and must not double-remove)
        expect(() => sm.dispose()).not.toThrow();
    });

    it("detaches the OpenLayers map from the DOM", () => {
        const sm = storymap("sm-dispose-target");
        const mapEl = document.querySelector("#sm-dispose-target > .vco-map") as HTMLElement;
        expect(mapEl).not.toBeNull();
        sm.dispose();
        // ol/Map#dispose leaves the canvas in place, but the target is unset
        // so the renderer can no longer paint into it
        expect(sm.map).toBeNull();
    });

    it("empties the host container", () => {
        const sm = storymap("sm-dispose-empty");
        const host = document.getElementById("sm-dispose-empty") as HTMLElement;
        // the viewer really did build its chrome in there
        expect(host.children.length).toBeGreaterThan(0);
        sm.dispose();
        // the children owned their own listeners and players, so leaving the
        // nodes behind would strand them in the document after teardown
        expect(host.children.length).toBe(0);
        expect(host.innerHTML).toBe("");
    });

    it("turns public method calls after dispose into no-ops", () => {
        const sm = storymap("sm-dispose-noop");
        sm.dispose();

        // terminal teardown: these are guarded rather than left to throw on a
        // dead map, so an SPA teardown racing a late click is harmless
        expect(() => sm.goTo(1)).not.toThrow();
        expect(() => sm.updateDisplay()).not.toThrow();
        expect(() => sm.setMapOption("zoom", 4)).not.toThrow();
        expect(() => sm.setMapOptions({ zoom: 5 })).not.toThrow();
        expect(() => sm.setOverlayVisible(0, true)).not.toThrow();
        expect(() => sm.setOverlayOpacity(0, 0.5)).not.toThrow();
        expect(() => sm.createMiniMap()).not.toThrow();
        expect(() => sm.setExtraAttributions(["x"])).not.toThrow();
        expect(() => sm.refreshLanguage("de")).not.toThrow();

        // the accessors degrade to empty/null rather than throwing
        expect(sm.getMarkers()).toEqual([]);
        expect(sm.getMarker(0)).toBeNull();
        expect(sm.getMinimap()).toBeNull();
        expect(sm.getLine()).toBeNull();
        expect(sm.getLineActive()).toBeNull();
        expect(sm.getOverlayLayers()).toEqual([]);
    });
});

describe("storymap imageready", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    it("fires imageready once per source", () => {
        const el = document.createElement("div");
        el.id = "sm-imageready-once";
        document.body.appendChild(el);
        const sm = new StoryMap("sm-imageready-once", {
            storymap: {
                map_type: "osm",
                slides: [{ date: "", type: "overview", text: { headline: "Overview", text: "" } }],
            },
        } as unknown as StorymapDataWrapper);

        const seen: unknown[] = [];
        sm.on("imageready", (e: unknown) => seen.push(e));

        const engine = (
            sm as unknown as {
                _map: {
                    fire(t: string, p: unknown): void;
                    _fireImageready(s: object, k: string): void;
                };
            }
        )._map;

        // the base layer and the minimap can report the same source; a host
        // should not have to filter duplicates
        const source = { getState: () => "ready" };
        engine._fireImageready(source, "tiles");
        engine._fireImageready(source, "tiles");
        expect(seen.length).toBe(1);

        // a different source is a new event
        engine._fireImageready({ getState: () => "ready" }, "iiif");
        expect(seen.length).toBe(2);

        // and the storymap forwards what the engine fires
        engine.fire("imageready", { source, kind: "tiles", layer: null });
        expect(seen.length).toBe(3);

        sm.dispose();
    });

    it("re-fires the map's imageready on the storymap", () => {
        const el = document.createElement("div");
        el.id = "sm-imageready";
        document.body.appendChild(el);
        const sm = new StoryMap("sm-imageready", {
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

        const seen: unknown[] = [];
        sm.on("imageready", (e: unknown) => seen.push(e));

        // drive the engine event the way a real source does when it loads
        const engine = (
            sm as unknown as {
                _map: { fire(t: string, p: unknown): void };
            }
        )._map;
        const payload = { source: {}, kind: "iiif", layer: {} };
        engine.fire("imageready", payload);

        // ol's Observable#fire passes the payload on with its own `type`
        expect(seen.length).toBe(1);
        expect(seen[0]).toMatchObject(payload);
        sm.dispose();
    });
});
