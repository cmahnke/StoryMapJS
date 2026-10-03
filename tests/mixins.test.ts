import { describe, expect, expectTypeOf, it } from "vitest";
import { Evented } from "../src/core/mixins";

/**
 * The emitter itself (`Evented`), directly: merge order, removal
 * semantics and the typed surface. Every earlier emitter bug survived
 * because no test exercised the mixin — only its consumers, indirectly.
 */

interface ProbeEvents {
    ping: { n: number };
    pong: { s: string };
}

class ProbeBase {}

class Probe extends Evented<ProbeEvents, typeof ProbeBase>(ProbeBase) {}

function probe(): Probe {
    return new Probe();
}

describe("Evented", () => {
    it("delivers the payload with type and target attached", () => {
        const p = probe();
        const seen: unknown[] = [];
        p.on("ping", (e) => seen.push(e));
        p.fire("ping", { n: 1 });
        expect(seen).toEqual([{ n: 1, type: "ping", target: p }]);
    });

    it("does not let a payload displace type or target", () => {
        const p = probe();
        const seen: unknown[] = [];
        p.on("ping", (e) => seen.push(e));
        p.fire("ping", { n: 1, type: "spoof", target: null } as ProbeEvents["ping"]);
        expect(seen).toEqual([{ n: 1, type: "ping", target: p }]);
    });

    it("off removes every matching listener, not just the first", () => {
        const p = probe();
        let calls = 0;
        const fn = () => calls++;
        p.on("ping", fn);
        p.on("ping", fn);
        p.off("ping", fn);
        expect(p.hasEventListeners("ping")).toBe(false);
        p.fire("ping", { n: 1 });
        expect(calls).toBe(0);
    });

    it("off filters on context", () => {
        const p = probe();
        const seen: string[] = [];
        const a = { name: "a" };
        const b = { name: "b" };
        function handler(this: { name: string }) {
            seen.push(this.name);
        }
        p.on("ping", handler, a);
        p.on("ping", handler, b);
        p.off("ping", handler, a);
        p.fire("ping", { n: 1 });
        expect(seen).toEqual(["b"]);
        expect(p.hasEventListeners("ping")).toBe(true);
    });

    it("dispatches in registration order", () => {
        const p = probe();
        const order: number[] = [];
        p.on("ping", () => order.push(1));
        p.on("ping", () => order.push(2));
        p.fire("ping", { n: 1 });
        expect(order).toEqual([1, 2]);
    });

    it("a listener removed mid-fire still runs that round (snapshot dispatch)", () => {
        const p = probe();
        const ran: string[] = [];
        const second = () => ran.push("second");
        p.on("ping", () => {
            ran.push("first");
            p.off("ping", second);
        });
        p.on("ping", second);
        p.fire("ping", { n: 1 });
        expect(ran).toEqual(["first", "second"]);
        // only the removed listener is gone; the remover itself stays
        expect(p.hasEventListeners("ping")).toBe(true);
    });

    it("a re-fire carries the firing object as target", () => {
        const inner = probe();
        const outer = probe();
        const seen: unknown[] = [];
        outer.on("pong", (e) => seen.push(e));
        inner.on("ping", () => outer.fire("pong", { s: "relay" }));
        inner.fire("ping", { n: 1 });
        expect(seen).toEqual([{ s: "relay", type: "pong", target: outer }]);
    });

    it("leaves no empty listener buckets behind", () => {
        const p = probe();
        const fn = () => {};
        p.on("ping", fn);
        p.off("ping", fn);
        const buckets = (p as unknown as { _vco_events?: Record<string, unknown[]> })._vco_events;
        expect(buckets === undefined || !("ping" in buckets)).toBe(true);
    });

    it("rejects unknown channels and mistyped payloads at compile time", () => {
        const p = probe();
        expectTypeOf(p.fire).toBeCallableWith("ping", { n: 1 });
        // @ts-expect-error - unknown channels do not typecheck
        p.fire("pongg", { s: "x" });
        // @ts-expect-error - payload shape is checked
        p.fire("ping", { n: "one" });
    });
});
